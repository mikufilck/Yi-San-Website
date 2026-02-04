# BackEnd/src/routers/cases.py
import io
import uuid
import math
from pathlib import Path
from typing import List, Optional
from PIL import Image

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc

from ..database import get_db, DBCase, DBUser
from ..config import settings
from ..dependencies.permissions import admin_required
from ..services.category_service import CategoryService # 必须引入
from ..models import (
    CaseCreate,
    CaseResponse,
    CaseCategoryResponse,
    PaginatedResponse,
    CaseImageSchema
)

# 安全配置：防御像素洪流攻击
Image.MAX_IMAGE_PIXELS = 100_000_000

router = APIRouter(tags=["Cases"])

# 定位上传目录
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 1. 静态查询接口
# ==========================================

@router.get("/categories", response_model=CaseCategoryResponse)
async def get_categories():
    """
    获取作品分类列表
    务实：直接调用 CategoryService，确保前后端 Slug 对应
    """
    return {"categories": CategoryService.get_all_categories()}


# ==========================================
# 2. 公开查询接口 (支持分页与分类过滤)
# ==========================================

@router.get("/", response_model=PaginatedResponse[CaseResponse])
@router.get("", response_model=PaginatedResponse[CaseResponse])
async def list_cases(
        page: int = Query(1, ge=1),
        size: int = Query(9, ge=1, le=100),
        category: Optional[str] = None,
        featured: Optional[bool] = None,
        db: AsyncSession = Depends(get_db)
):
    """获取作品列表 (支持分页、分类、精选过滤)"""
    query = select(DBCase)

    if category:
        # 核心逻辑：自动将前端 Slug 转换为后端 Label
        backend_val = CategoryService.frontend_to_backend(category) or category
        query = query.where(DBCase.categories.contains([backend_val]))

    if featured is not None:
        query = query.where(DBCase.featured == featured)

    # 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页查询
    query = query.order_by(desc(DBCase.created_at)).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    items = result.scalars().all()

    pages = math.ceil(total / size) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
        "size": size
    }


# ==========================================
# 3. 详情查询 (动态路由)
# ==========================================

@router.get("/{slug}", response_model=CaseResponse)
async def get_case_detail(slug: str, db: AsyncSession = Depends(get_db)):
    """获取单个案例详情"""
    result = await db.execute(select(DBCase).where(DBCase.slug == slug))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="案例未找到")
    return case


# ==========================================
# 4. 管理端：增删改
# ==========================================

@router.post("/", response_model=CaseResponse)
async def create_case(
        case_in: CaseCreate,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """创建新案例"""
    existing = await db.execute(select(DBCase).where(DBCase.slug == case_in.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="URL 标识(Slug)已存在")

    db_case = DBCase(**case_in.model_dump())
    db.add(db_case)
    await db.commit()
    await db.refresh(db_case)
    return db_case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
        case_id: int,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """删除案例"""
    result = await db.execute(select(DBCase).where(DBCase.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="记录不存在")

    await db.delete(case)
    await db.commit()
    return None


# ==========================================
# 5. 图片上传 (HD + Thumbnail)
# ==========================================

@router.post("/upload")
async def upload_case_image(
        file: UploadFile = File(...),
        _: DBUser = Depends(admin_required)
):
    """图片处理：WebP 格式化 + 缩略图生成"""
    ext = Path(file.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="仅支持 JPG/PNG/WebP 格式")

    file_uuid = uuid.uuid4().hex

    try:
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # 保存高清图与缩略图
        hd_filename = f"{file_uuid}.webp"
        img.save(UPLOAD_DIR / hd_filename, "WEBP", quality=85, optimize=True)

        thumb_img = img.copy()
        thumb_img.thumbnail((600, 600), Image.Resampling.LANCZOS)
        thumb_filename = f"{file_uuid}_thumb.webp"
        thumb_img.save(UPLOAD_DIR / thumb_filename, "WEBP", quality=75)

        return {
            "url": f"/uploads/{hd_filename}",
            "thumbnail_url": f"/uploads/{thumb_filename}",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")
