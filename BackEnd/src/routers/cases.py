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
from ..models import (
    CaseCreate,
    CaseResponse,
    PaginatedResponse,  # 引用新定义的泛型分页
    CaseImageSchema
)

# 安全配置：防御像素洪流攻击
Image.MAX_IMAGE_PIXELS = 100_000_000

router = APIRouter(tags=["Cases"])

# 定位上传目录 (务实：相对于 backend/ 根目录)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 1. 公开查询接口 (支持分页与分类过滤)
# ==========================================

@router.get("/", response_model=PaginatedResponse[CaseResponse])
async def list_cases(
        page: int = Query(1, ge=1),
        size: int = Query(9, ge=1, le=100),
        category: Optional[str] = None,
        featured: Optional[bool] = None,
        db: AsyncSession = Depends(get_db)
):
    """
    获取作品列表
    务实逻辑：支持分页、分类过滤、精选过滤
    """
    # 1. 构建查询
    query = select(DBCase)

    if category:
        # PostgreSQL JSONB 包含查询
        query = query.where(DBCase.categories.contains([category]))

    if featured is not None:
        query = query.where(DBCase.featured == featured)

    # 2. 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 3. 分页查询
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
# 2. 详情查询
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
# 3. 管理端：创建/更新/删除
# ==========================================

@router.post("/", response_model=CaseResponse)
async def create_case(
        case_in: CaseCreate,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """创建新案例"""
    # 检查 Slug 是否重复
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
# 4. 图片上传处理 (HD + Thumbnail)
# ==========================================

@router.post("/upload")
async def upload_case_image(
        file: UploadFile = File(...),
        _: DBUser = Depends(admin_required)
):
    """
    上传并处理案例图片
    务实优化：自动生成 WebP 格式，生成缩略图以减轻前端加载压力
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="仅支持 JPG/PNG/WebP 格式")

    file_uuid = uuid.uuid4().hex

    try:
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # 1. 保存高清大图
        hd_filename = f"{file_uuid}.webp"
        hd_path = UPLOAD_DIR / hd_filename
        img.save(hd_path, "WEBP", quality=85, optimize=True)

        # 2. 保存适配前端的缩略图 (_thumb)
        thumb_img = img.copy()
        thumb_img.thumbnail((600, 600), Image.Resampling.LANCZOS)
        thumb_filename = f"{file_uuid}_thumb.webp"
        thumb_path = UPLOAD_DIR / thumb_filename
        thumb_img.save(thumb_path, "WEBP", quality=75)

        return {
            "url": f"/uploads/{hd_filename}",
            "thumbnail_url": f"/uploads/{thumb_filename}",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")