# BackEnd/src/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from ..database import get_db, DBUser, DBProject
from ..config import settings
from ..models import (
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
    ClientLoginRequest,
    Token  # 引用我们新定义的 Token 统一模型
)
from ..auth import verify_password, create_access_token, get_current_user, get_password_hash
# 从 main 导入限频实例
from ..main import limiter

router = APIRouter(tags=["Authentication"])


# ==========================================
# 1. 管理端登录 (适配 LoginPage.tsx)
# ==========================================
@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_LOGIN)  # 🛡️ IP 频率限制：5次/分钟
async def login_for_access_token(
        request: Request,  # limiter 必须接收 request
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db)
):
    """
    管理员登录接口
    务实：拦截暴力破解，失败时返回标准 401
    """
    query_name = form_data.username.lower().strip()
    result = await db.execute(select(DBUser).where(DBUser.username == query_name))
    user = result.scalar_one_or_none()

    # 务实安全：不区分“用户名不存在”还是“密码错误”，统一返回凭证无效
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码不正确 / Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="账号已被禁用")

    # 签发 Token
    access_token = create_access_token(data={"sub": user.username, "type": "admin"})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user  # 适配前端 UserResponse 结构
    }


# ==========================================
# 2. 业主端登录 (适配 ClientLoginPage.tsx)
# ==========================================
@router.post("/client/login")
@limiter.limit(settings.RATE_LIMIT_LOGIN)  # 🛡️ 核心：防止 6 位访问码被爆破
async def client_login(
        request: Request,
        data: ClientLoginRequest,
        db: AsyncSession = Depends(get_db)
):
    """
    业主端入口。
    务实：通过 项目号(project_no) + 访问码(access_code) 双重验证
    """
    result = await db.execute(
        select(DBProject).where(
            DBProject.project_no == data.project_no.strip(),
            DBProject.access_code == data.access_code.strip()
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="项目编号或访问码无效 / Invalid access code"
        )

    # 签发专用 Client Token，sub 存储 ID
    client_token = create_access_token(
        data={"sub": str(project.id), "type": "client"}
    )

    return {
        "status": "success",
        "project_id": project.id,
        "client_name": project.client_name,
        "access_token": client_token,
        "token_type": "bearer"
    }


# ==========================================
# 3. 个人信息与修改密码
# ==========================================

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: DBUser = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return current_user


@router.post("/change-password")
@limiter.limit("3/hour")  # 修改密码操作给予极高的保护限制
async def change_password(
        request: Request,
        data: ChangePasswordRequest,
        db: AsyncSession = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    """
    管理端用户修改密码逻辑
    """
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="原密码错误")

    current_user.hashed_password = get_password_hash(data.new_password)
    await db.commit()

    return {"status": "success", "message": "密码修改成功"}