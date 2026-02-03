# BackEnd/src/routers/products.py
import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from pydantic import BaseModel

from ..database import get_db, DBProduct, DBUser
from ..dependencies.permissions import admin_required
from ..models import (
    ProductResponse,
    ProductBase,
    PaginatedResponse  # 引用分页泛型
)

router = APIRouter(tags=["Products"])


# ==========================================
# 1. 局部业务模型 (补丁)
# ==========================================

class ProductCreate(ProductBase):
    """局部定义创建模型，解决导入报错"""
    is_active: bool = True


# ==========================================
# 2. 获取产品列表 (支持分页与分类过滤)
# ==========================================

@router.get("/", response_model=PaginatedResponse[ProductResponse])
async def list_products(
        page: int = Query(1, ge=1),
        size: int = Query(12, ge=1, le=100),
        category: Optional[str] = None,
        db: AsyncSession = Depends(get_db)
):
    """
    获取产品列表
    务实逻辑：前台展示仅显示 active，后台分页支持
    """
    query = select(DBProduct).where(DBProduct.is_active == True)

    if category:
        query = query.where(DBProduct.category == category)

    # 计算总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页查询
    query = query.order_by(desc(DBProduct.created_at)).offset((page - 1) * size).limit(size)
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
# 3. 获取详情与管理
# ==========================================

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """获取单个详情"""
    result = await db.execute(select(DBProduct).where(DBProduct.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="工艺产品未找到")
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
        product_in: ProductCreate,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """发布新产品"""
    db_product = DBProduct(**product_in.model_dump())
    db.add(db_product)
    try:
        await db.commit()
        await db.refresh(db_product)
        return db_product
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"创建失败: {str(e)}")


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
        product_id: int,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """删除产品记录"""
    result = await db.execute(select(DBProduct).where(DBProduct.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="记录不存在")

    await db.delete(product)
    await db.commit()
    return None