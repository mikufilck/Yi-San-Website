# backend/src/routers/admin_projects.py
import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field

from ..database import get_db, DBProject, DBNode, DBProjectMedia, DBProjectLog, DBUser, DBProjectResource
from ..dependencies.permissions import admin_required
from ..models import (
    AdminProjectResponse,
    ProjectResponse,
    ProjectResourceResponse
)

router = APIRouter(tags=["Admin Projects"])


# ==========================================
# 1. 局部业务模型 (针对 models.py 的脱水补丁)
# ==========================================

class ProjectCreateSchema(BaseModel):
    project_no: str
    access_code: str = Field(..., min_length=6)
    client_name: str
    address: Optional[str] = None


class NodeUpdateSchema(BaseModel):
    status: str  # pending, ongoing, completed
    remark: Optional[str] = None


class AdminLogReplyRequest(BaseModel):
    content: str
    node_id: Optional[int] = None


class ProjectResourceCreate(BaseModel):
    resource_type: str  # report, vr
    title: str
    url: str


class SyncProgressRequest(BaseModel):
    nodes: List[dict]
    current_progress: int


# ==========================================
# 2. 项目列表与详情
# ==========================================

@router.get("", response_model=List[ProjectResponse])
async def list_projects(
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """获取所有项目简表"""
    result = await db.execute(
        select(DBProject).order_by(DBProject.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=AdminProjectResponse)
async def create_project(
        data: ProjectCreateSchema,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """创建新项目"""
    # 检查项目编号是否冲突
    check = await db.execute(select(DBProject).where(DBProject.project_no == data.project_no))
    if check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="项目编号已存在")

    new_project = DBProject(**data.model_dump())
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    return new_project


@router.get("/{project_id}", response_model=AdminProjectResponse)
async def get_project_detail(
        project_id: int,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """管理端获取项目完整详情 (含访问码)"""
    result = await db.execute(
        select(DBProject)
        .options(
            selectinload(DBProject.nodes),
            selectinload(DBProject.logs),
            selectinload(DBProject.resources),
            selectinload(DBProject.medias)
        )
        .where(DBProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


# ==========================================
# 3. 施工节点管理 (数字化工地核心)
# ==========================================

@router.post("/{project_id}/sync-nodes")
async def sync_project_nodes(
        project_id: int,
        data: SyncProgressRequest,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """同步施工节点进度"""
    # 1. 更新主进度
    await db.execute(
        update(DBProject)
        .where(DBProject.id == project_id)
        .values(current_progress=data.current_progress)
    )

    # 2. 处理节点更新（由于逻辑较重，这里采用删除重建或按 ID 更新，务实选择全量同步）
    await db.execute(delete(DBNode).where(DBNode.project_id == project_id))

    for node_data in data.nodes:
        new_node = DBNode(
            project_id=project_id,
            node_name=node_data.get("node_name"),
            target_percent=node_data.get("target_percent"),
            status=node_data.get("status", "pending")
        )
        db.add(new_node)

    await db.commit()
    return {"status": "success"}


# ==========================================
# 4. 资源与回复逻辑
# ==========================================

@router.post("/{project_id}/resources", response_model=ProjectResourceResponse)
async def add_project_resource(
        project_id: int,
        res: ProjectResourceCreate,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """关联 VR 全景或施工周报链接"""
    new_res = DBProjectResource(project_id=project_id, **res.model_dump())
    db.add(new_res)
    await db.commit()
    await db.refresh(new_res)
    return new_res


@router.post("/{project_id}/reply")
async def admin_reply(
        project_id: int,
        req: AdminLogReplyRequest,
        db: AsyncSession = Depends(get_db),
        current_user: DBUser = Depends(admin_required)
):
    """管理员发布施工日志或回复"""
    new_log = DBProjectLog(
        project_id=project_id,
        content=req.content,
        sender_type="admin",
        operator=current_user.username,
        node_id=req.node_id
    )
    db.add(new_log)
    await db.commit()
    return {"status": "success"}


@router.delete("/{project_id}")
async def delete_project(
        project_id: int,
        db: AsyncSession = Depends(get_db),
        _: DBUser = Depends(admin_required)
):
    """删除项目"""
    result = await db.execute(select(DBProject).where(DBProject.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    await db.delete(project)
    await db.commit()
    return {"status": "success"}