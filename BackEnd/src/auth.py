# backend/src/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import bcrypt

from .database import get_db, DBUser, DBProject
from .config import settings  # 统一引用配置对象

# ==========================================
# 1. 配置初始化
# ==========================================
# tokenUrl 指向管理端登录路由，Swagger UI 会使用此地址进行调试
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ==========================================
# 2. 密码哈希处理 (Bcrypt)
# ==========================================
def get_password_hash(password: str) -> str:
    """生成密码哈希 - 务实建议：使用 12 轮加盐平衡性能与安全"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码与哈希值"""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


# ==========================================
# 3. JWT 核心逻辑
# ==========================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """生成 JWT 访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    # 使用 config.py 中定义的 SECRET_KEY 和 ALGORITHM
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# ==========================================
# 4. 权限依赖注入 (核心引擎)
# ==========================================
async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db)
) -> Union[DBUser, DBProject]:
    """
    通用鉴权依赖：
    1. 管理员 Token -> 返回 DBUser 对象 (role 为 admin/super_admin)
    2. 业主端 Token -> 返回 DBProject 对象 (并动态注入 role="client")
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="身份验证已过期或无效 / Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 解码 Token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        subject: str = payload.get("sub")
        token_type: str = payload.get("type")  # admin 或 client

        if subject is None or token_type is None:
            raise credentials_exception

        # --- 分支 A：管理员端 (Admin/Super) ---
        if token_type == "admin":
            result = await db.execute(select(DBUser).where(DBUser.username == subject))
            user = result.scalar_one_or_none()

            if user is None or not user.is_active:
                raise credentials_exception
            return user

        # --- 分支 B：业主端 (Client Portal) ---
        elif token_type == "client":
            # 业主 Token 的 sub 存储的是关联的项目 ID
            result = await db.execute(select(DBProject).where(DBProject.id == int(subject)))
            project = result.scalar_one_or_none()

            if not project:
                raise credentials_exception

            # 務實注入：DBProject 表中通常没有 role 字段，
            # 但为了兼容前端权限守卫 (RoleProtectedRoute.tsx)，
            # 我们在此动态注入 role 属性。
            setattr(project, "role", "client")
            return project

        else:
            raise credentials_exception

    except (JWTError, ValueError):
        raise credentials_exception


# ==========================================
# 5. 辅助工具：快速提取项目 ID
# ==========================================
async def get_current_project_id(token: str = Depends(oauth2_scheme)) -> int:
    """
    仅在需要 project_id 而不需要查询数据库的轻量场景下使用
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "client":
            raise HTTPException(status_code=403, detail="此接口仅限业主端访问")
        return int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="无效的项目授权")