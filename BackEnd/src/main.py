# backend/src/main.py
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# --- 1. 引入频率限制组件 ---
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# 1. 路径与环境初始化
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

load_dotenv()
from .config import settings
from .middleware.error_handler import error_handler_middleware

IS_PROD = os.getenv("ENV") == "production"

# --- 2. 初始化限频器 (内存模式) ---
# key_func=get_remote_address 表示根据客户端 IP 进行限制
limiter = Limiter(key_func=get_remote_address)

# --- 3. 异步生命周期管理 ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    from .database import engine, Base
    try:
        # 确保物理上传目录在启动前存在
        upload_path = BASE_DIR / "public" / "uploads"
        upload_path.mkdir(parents=True, exist_ok=True)

        # 数据库表结构同步 (务实建议：生产环境应通过 Alembic 管理)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("🚀 [Backend] Database connected & Schema verified")

        yield
    finally:
        # 优雅关闭连接池
        await engine.dispose()
        print("🛑 [Backend] Database connection closed")

# --- 4. 实例化应用并挂载限频器 ---
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# 将限频器状态绑定到 app
app.state.limiter = limiter
# 注册限频触发时的异常处理器 (自动返回 429 Too Many Requests)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- 5. 中间件配置 ---
app.middleware("http")(error_handler_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if IS_PROD else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# --- 6. 业务路由挂载 ---
from .routers import cases, users, auth, products, client, admin_projects
from .routers.bookings import router as bookings_router

# 注意：具体的接口限频将在各路由文件中通过 @limiter.limit 装饰器实现
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(client.router, prefix="/api/client", tags=["Client Portal"])
app.include_router(admin_projects.router, prefix="/api/admin/projects", tags=["Admin Projects"])
app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])

# --- 7. 静态文件挂载 ---
upload_dir = str(BASE_DIR / "public" / "uploads")
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# --- 8. 基础接口与限频示例 ---
@app.get("/api/health")
@limiter.limit("20/minute")  # 内存限频示例：每分钟允许 20 次访问
async def health_check(request: Request):
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENV
    }