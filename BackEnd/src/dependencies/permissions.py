# BackEnd/src/dependencies/permissions.py
from fastapi import HTTPException, Depends, status
from ..auth import get_current_user
from ..database import DBUser, DBProject
from typing import Union


# ==========================================
# 1. 超级管理员守卫 (Super Admin Only)
# ==========================================
async def super_admin_required(current_user: DBUser = Depends(get_current_user)):
    """
    最严格权限：仅限角色为 super_admin 的用户。
    用于管理其他管理员、重置系统全局配置。
    """
    # 使用 getattr 防御模型实例可能存在的属性缺失
    role = getattr(current_user, "role", None)

    if role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足：该操作仅限超级管理员执行 / Super Admin Required"
        )
    return current_user


# ==========================================
# 2. 通用管理员守卫 (Admin & Super Admin)
# ==========================================
async def admin_required(current_user: DBUser = Depends(get_current_user)):
    """
    标准管理权限：允许普通管理员和超级管理员访问。
    用于管理案例、产品、预约和项目进度同步。
    """
    role = getattr(current_user, "role", None)

    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足：该操作需要管理员权限 / Admin Access Required"
        )
    return current_user


# ==========================================
# 3. 业主端访问守卫 (Client & Admin God-Mode)
# ==========================================
async def client_required(current_user: Union[DBUser, DBProject] = Depends(get_current_user)):
    """
    业主访问权限：允许业主本人访问，同时允许管理员以“上帝视角”进入。

    - 在 auth.py 中，我们已为 DBProject 对象动态注入了 role="client"。
    - 允许管理员访问是为了方便客服或设计师直接查看业主端界面进行协助。
    """
    role = getattr(current_user, "role", None)

    if role not in ["client", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足：请以业主或管理员身份登录 / Client Access Required"
        )

    return current_user
