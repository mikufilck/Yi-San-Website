# BackEnd/src/routers/bookings.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db, DBBooking, DBUser
from ..dependencies.permissions import admin_required
from ..models import BookingCreate, BookingResponse

router = APIRouter(tags=["Bookings"])


# ==========================================
# 1. 局部业务模型 (针对 models.py 的脱水补丁)
# ==========================================

class BookingUpdateSchema(BaseModel):
    """用于更新预约状态的局部模型"""
    status: str  # pending, processing, completed
    is_read: Optional[bool] = None


# ==========================================
# 2. 客户提交预约 (公开接口)
# ==========================================

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
        booking_in: BookingCreate,
        db: AsyncSession = Depends(get_db)
):
    """
    提交预约申请。
    适配前端：BookingForm.tsx
    """
    db_booking = DBBooking(**booking_in.model_dump())

    # 强制初始化初始状态
    db_booking.status = "pending"
    db_booking.is_read = False

    db.add(db_booking)
    try:
        await db.commit()
        await db.refresh(db_booking)
        return db_booking
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="提交失败，请稍后重试")


# ==========================================
# 3. 管理端：查询与状态维护
# ==========================================

@router.get("/", response_model=List[BookingResponse])
async def list_bookings(
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """获取所有预约记录 (按时间倒序)"""
    result = await db.execute(
        select(DBBooking).order_by(desc(DBBooking.created_at))
    )
    return result.scalars().all()


@router.put("/{booking_id}")
async def update_booking_status(
        booking_id: int,
        data: BookingUpdateSchema,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """
    更新预约状态或标记已读。
    务实联动：如果状态设为 completed，自动标记为已读。
    """
    result = await db.execute(select(DBBooking).where(DBBooking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 更新字段
    booking.status = data.status
    if data.is_read is not None:
        booking.is_read = data.is_read

    # 逻辑联动
    if data.status == "completed":
        booking.is_read = True

    await db.commit()
    return {"status": "success", "current_status": booking.status}


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
        booking_id: int,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """删除无效或垃圾预约记录"""
    result = await db.execute(select(DBBooking).where(DBBooking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="记录不存在")

    await db.delete(booking)
    await db.commit()
    return None