# BackEnd/src/routers/users.py
from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, Field

from ..database import get_db, DBUser
from ..auth import get_password_hash
from ..models import UserCreate, UserResponse, UserUpdate
from ..dependencies.permissions import super_admin_required, admin_required

router = APIRouter(tags=["User Management"])


# ==========================================
# 1. 局部业务模型 (补丁)
# ==========================================

class PasswordResetRequest(BaseModel):
    """超级管理员重置密码请求"""
    new_password: str = Field(..., min_length=8)


# ==========================================
# 2. 管理员列表 (适配 AdminManagement 表格)
# ==========================================

@router.get("/", response_model=List[UserResponse])
async def get_users_list(
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """
    获取所有管理员列表。
    务实逻辑：动态判定在线状态，若 5 分钟内无活动则视为离线。
    """
    result = await db.execute(select(DBUser).order_by(DBUser.id))
    db_users = result.scalars().all()

    now = datetime.now(timezone.utc)
    for user in db_users:
        # 如果 last_active 超过 5 分钟，强制在返回给前端的视图中显示为离线
        if user.last_active:
            # 确保 user.last_active 也是带时区的
            last_active = user.last_active.replace(
                tzinfo=timezone.utc) if not user.last_active.tzinfo else user.last_active
            if now - last_active > timedelta(minutes=5):
                user.is_online = False

    return db_users


# ==========================================
# 3. 账号管理 (仅限超级管理员)
# ==========================================

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_admin(
        user_in: UserCreate,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(super_admin_required)
):
    """创建新的管理员账号"""
    # 检查唯一性
    check = await db.execute(
        select(DBUser).where((DBUser.username == user_in.username) | (DBUser.email == user_in.email))
    )
    if check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="用户名或邮箱已存在")

    new_user = DBUser(
        username=user_in.username.lower().strip(),
        email=user_in.email.strip(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role="admin",  # 默认新创建的都是普通管理员
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.put("/{user_id}/reset-password")
async def reset_user_password(
        user_id: int,
        data: PasswordResetRequest,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(super_admin_required)
):
    """重置指定管理员的密码"""
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")

    db_user.hashed_password = get_password_hash(data.new_password)
    db_user.is_online = False  # 强制该用户下次访问时重新登录
    await db.commit()

    return {"status": "success", "message": f"管理员 {db_user.username} 的密码已重置"}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_account(
        user_id: int,
        db: AsyncSession = Depends(get_db),
        current_admin: DBUser = Depends(super_admin_required)
):
    """
    删除管理员账号。
    安全限制：禁止自删。
    """
    if current_admin.id == user_id:
        raise HTTPException(status_code=400, detail="不能删除自己的账号")

    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=404, detail="记录不存在")

    if db_user.role == "super_admin" and current_admin.username != "super_admin":
        raise HTTPException(status_code=403, detail="无权删除其他超级管理员")

    await db.delete(db_user)
    await db.commit()
    return None