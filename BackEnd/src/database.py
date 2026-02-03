# backend/src/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

from .config import settings  # 统一引用已校验的配置

# ==========================================
# 1. 引擎与会话配置 (异步连接池)
# ==========================================
# 务实优化：增加 pool 配置以应对并发访问
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,  # 保持 10 个常驻连接
    max_overflow=20,  # 繁忙时允许额外开启 20 个连接
    pool_recycle=3600,  # 每小时回收连接，防止被数据库强制断开
    pool_pre_ping=True  # 每次取出连接前先检查是否存活
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()


# ==========================================
# 2. 核心业务模型 (ORM Models)
# ==========================================

class DBUser(Base):
    """管理端用户信息表"""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default="admin")  # super_admin, admin
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)
    last_active = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DBProduct(Base):
    """官方案例涉及的工艺与产品表"""
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(200))
    summary = Column(Text)
    description = Column(Text)
    cover_image = Column(String(500))
    specs = Column(JSONB, default=[])      # 规格参数
    highlights = Column(JSONB, default=[]) # 亮点/特色
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DBProject(Base):
    """业主项目表 (Client Portal 核心)"""
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    project_no = Column(String(50), unique=True, index=True, nullable=False)
    access_code = Column(String(20), nullable=False)  # 业主访问码
    client_name = Column(String(100), nullable=False)
    client_email = Column(String(100))
    address = Column(Text)
    current_progress = Column(Integer, default=0)
    status = Column(String(20), default="進行中")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关联
    nodes = relationship("DBNode", back_populates="project", cascade="all, delete-orphan")
    logs = relationship("DBProjectLog", back_populates="project", cascade="all, delete-orphan")
    medias = relationship("DBProjectMedia", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("DBProjectResource", back_populates="project", cascade="all, delete-orphan")


class DBNode(Base):
    """施工节点表 (数字化工地)"""
    __tablename__ = "project_nodes"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    node_name = Column(String(100), nullable=False)
    target_percent = Column(Integer, default=0)
    status = Column(String(20), default="pending")  # pending, ongoing, completed
    completed_at = Column(DateTime(timezone=True))

    project = relationship("DBProject", back_populates="nodes")


class DBProjectLog(Base):
    """项目沟通/施工记录"""
    __tablename__ = "project_logs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    node_id = Column(Integer, ForeignKey("project_nodes.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    images = Column(JSONB, default=[])  # 存储图片路径数组
    sender_type = Column(String(20))  # admin, client
    operator = Column(String(100))  # 具体操作人姓名
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("DBProject", back_populates="logs")


class DBProjectMedia(Base):
    """项目现场媒体库 (图片/视频)"""
    __tablename__ = "project_medias"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    media_type = Column(String(20), default="image")
    url = Column(String(500), nullable=False)
    category = Column(String(50))  # 阶段分类
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("DBProject", back_populates="medias")


class DBProjectResource(Base):
    """项目外部资源 (VR360/施工周报)"""
    __tablename__ = "project_resources"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    resource_type = Column(String(20), nullable=False)  # report, vr
    title = Column(String(200), nullable=False)
    url = Column(String(1000), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("DBProject", back_populates="resources")


class DBCase(Base):
    """官方案例展示表"""
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    chinese_title = Column(String(200), nullable=False)
    description = Column(Text)
    detailed_description = Column(Text)
    location = Column(String(100))
    area = Column(Float)
    year = Column(Integer)
    categories = Column(JSONB, default=[])  # 分类标签
    styles = Column(JSONB, default=[])  # 风格标签
    images = Column(JSONB, default=[])  # 结构化图片数组
    featured = Column(Boolean, default=False)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DBBooking(Base):
    """客户预约/咨询表"""
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    contact_info = Column(String(100), nullable=False)
    project_type = Column(String(50))
    budget = Column(String(50))
    message = Column(Text)
    source_url = Column(String(255))  # 记录客户是从哪个页面发起的咨询
    status = Column(String(20), default="pending")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==========================================
# 3. 依赖注入函数 (Dependency)
# ==========================================
async def get_db():

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()