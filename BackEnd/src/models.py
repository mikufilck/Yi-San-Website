# backend/src/models.py
from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field, ConfigDict, computed_field
from datetime import datetime
from typing import Optional, List, Any, TypeVar, Generic
from enum import Enum

T = TypeVar("T")

# ==========================================
# 1. 基础枚举与认证模型
# ==========================================

class NodeStatus(str, Enum):
    PENDING = "pending"
    ONGOING = "ongoing"
    COMPLETED = "completed"

class ProjectStatus(str, Enum):
    ONGOING = "進行中"
    PAUSED = "已暫停"
    COMPLETED = "已完工"
    ARCHIVED = "已歸檔"

class ResourceType(str, Enum):
    REPORT = "report"
    VR = "vr"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Any  # 返回给前端的简单用户信息

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[int] = None

# ==========================================
# 2. 分页通用包装器
# ==========================================

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    pages: int
    size: int

# ==========================================
# 3. 用户与认模型
# ==========================================

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None
    role: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, pattern="^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    is_online: bool
    last_active: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 4. 案例与产品模型 (Structured JSONB)
# ==========================================

class CaseImageSchema(BaseModel):
    """适配数据库 JSONB 中的图片结构"""
    id: Optional[int] = None
    url: str
    thumbnail_url: Optional[str] = None
    alt: str = "Yisan Design"
    is_primary: bool = False
    order: int = 0

class CaseBase(BaseModel):
    slug: str = Field(..., pattern="^[a-z0-9-]+$")
    title: str
    chinese_title: str
    location: Optional[str] = "中国"
    area: float = 0
    year: int = Field(default_factory=lambda: datetime.now().year)
    categories: List[str] = []
    styles: List[str] = []
    images: List[CaseImageSchema] = [] # 升级为结构化数组
    featured: bool = False
    status: str = "completed"

class CaseCreate(CaseBase):
    description: Optional[str] = None
    detailed_description: Optional[str] = None

class CaseResponse(CaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    category: str
    title: str
    subtitle: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    specs: List[dict] = []
    highlights: List[dict] = []

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 5. 装修项目查询系统 (数字工地)
# ==========================================

class ProjectResourceResponse(BaseModel):
    id: int
    resource_type: str
    title: str
    url: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProjectLogResponse(BaseModel):
    id: int
    node_id: Optional[int] = None
    content: str
    images: List[str] = []
    sender_type: str
    operator: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProjectNodeResponse(BaseModel):
    id: int
    node_name: str
    target_percent: int
    status: NodeStatus
    completed_at: Optional[datetime] = None
    logs: List[ProjectLogResponse] = []
    model_config = ConfigDict(from_attributes=True)

class ProjectResponse(BaseModel):
    """业主端核心展示模型"""
    id: int
    project_no: str
    client_name: str
    address: Optional[str] = None
    current_progress: int
    status: str
    nodes: List[ProjectNodeResponse] = []
    resources: List[ProjectResourceResponse] = []
    logs: List[ProjectLogResponse] = []

    @computed_field
    @property
    def latest_vr(self) -> Optional[ProjectResourceResponse]:
        vrs = [r for r in self.resources if r.resource_type == "vr"]
        return sorted(vrs, key=lambda x: x.created_at, reverse=True)[0] if vrs else None

    @computed_field
    @property
    def latest_report(self) -> Optional[ProjectResourceResponse]:
        reports = [r for r in self.resources if r.resource_type == "report"]
        return sorted(reports, key=lambda x: x.created_at, reverse=True)[0] if reports else None

    @computed_field
    @property
    def chat_logs(self) -> List[ProjectLogResponse]:
        return [log for log in self.logs if log.node_id is None]

    model_config = ConfigDict(from_attributes=True)

class AdminProjectResponse(ProjectResponse):
    """管理端模型：包含敏感访问码"""
    access_code: str

# ==========================================
# 6. 预约系统
# ==========================================

class BookingCreate(BaseModel):
    user_name: str = Field(..., min_length=1)
    contact_info: str = Field(..., min_length=1)
    project_type: str
    budget: Optional[str] = None
    message: Optional[str] = None
    source_url: Optional[str] = None

class BookingResponse(BookingCreate):
    id: int
    status: str = "pending"
    is_read: bool = False
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ClientLoginRequest(BaseModel):
    project_no: str = Field(..., min_length=1)
    access_code: str = Field(..., min_length=6) # 业主访问码通常为 6 位