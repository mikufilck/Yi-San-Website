# backend/src/config.py
import json
import os
from pathlib import Path
from typing import List, Union, Optional
from pydantic import field_validator, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

# 定位项目根目录 (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """
    系统全局配置管理
    务实逻辑：所有配置优先从 .env 读取，若无则使用默认值
    """
    # --- 1. 基础应用配置 ---
    APP_NAME: str = "一三设计 · YISAN Design CMS"
    APP_VERSION: str = "1.2.6"
    ENV: str = "development"  # development / production
    DEBUG: bool = False

    @property
    def IS_PROD(self) -> bool:
        return self.ENV == "production"

    # --- 2. 数据库配置 (异步驱动) ---
    # 强制使用 asyncpg 协议
    DATABASE_URL: str = "postgresql+asyncpg://postgres:yssj123@localhost:5432/design_cases_db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # --- 3. 安全与认证 (JWT) ---
    SECRET_KEY: str = "yisan-design-studio-default-dev-key-change-it-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720  # 默认 12 小时

    # --- 4. 频率限制配置 (基于内存) ---
    # 敏感接口限制（登录等）
    RATE_LIMIT_LOGIN: str = "5/minute"
    # 普通接口限制
    RATE_LIMIT_DEFAULT: str = "60/minute"

    # --- 5. 跨域配置 (CORS) ---
    # 支持从 .env 以逗号分隔读取: http://localhost:3000,http://localhost:5173
    ALLOWED_ORIGINS: Union[List[str], str] = []

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["): # 兼容 JSON 格式
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return []

    # --- 6. 邮件服务配置 (SMTP) ---
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 465
    MAIL_SERVER: str = "smtp.163.com"
    MAIL_FROM_NAME: str = "一三设计项目部"

    # --- 7. 配置加载逻辑 ---
    # 自动加载当前目录上级文件夹下的 .env 文件
    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding='utf-8',
        case_sensitive=False,  # 环境变量不区分大小写
        extra='ignore'         # 忽略额外的环境变量
    )

# 实例化单例
settings = Settings()