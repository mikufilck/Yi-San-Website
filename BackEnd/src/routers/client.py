# backend/src/routers/client.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from sqlalchemy.orm import selectinload
from typing import Any, List

from ..database import get_db, DBProject, DBNode, DBProjectLog
from ..dependencies.permissions import client_required
from ..models import ProjectResponse

router = APIRouter(tags=["Client Portal"])


# ==========================================
# 1. 获取项目详情 (业主视角)
# ==========================================

@router.get("/project/{project_id}", response_model=ProjectResponse)
async def get_client_project_detail(
        project_id: int,
        db: AsyncSession = Depends(get_db),
        current_project: DBProject = Depends(client_required)
):
    """
    业主获取项目全量数据。
    务实逻辑：深度加载所有关联资源，以便前端计算属性（如最新 VR）生效。
    """
    # 权限校验：业主只能访问 Token 绑定的项目
    if project_id != current_project.id:
        raise HTTPException(status_code=403, detail="无权访问此项目数据 / Unauthorized")

    # 使用 selectinload 解决 N+1 问题
    result = await db.execute(
        select(DBProject)
        .options(
            selectinload(DBProject.nodes).selectinload(DBNode.logs),
            selectinload(DBProject.resources),
            selectinload(DBProject.logs),
            selectinload(DBProject.medias)
        )
        .where(DBProject.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="项目信息不存在")

    return project


# ==========================================
# 2. 业主确认验收 (核心交互)
# ==========================================

@router.post("/project/node/{node_id}/accept")
async def confirm_node_acceptance(
        node_id: int,
        content: str = Body(None, embed=True),  # 业主可选填反馈意见
        db: AsyncSession = Depends(get_db),
        current_project: DBProject = Depends(client_required)
):
    """
    业主在线确认节点验收。
    务实联动：1. 标记节点完成 2. 自动更新项目总进度 3. 自动生成沟通日志
    """
    # 1. 获取并验证节点所属权
    result = await db.execute(
        select(DBNode).where(
            DBNode.id == node_id,
            DBNode.project_id == current_project.id
        )
    )
    node = result.scalar_one_or_none()

    if not node:
        raise HTTPException(status_code=404, detail="节点不存在或无权操作")

    if node.status == 'completed':
        return {"status": "info", "message": "该节点已处于完成状态"}

    # 2. 更新节点状态
    node.status = 'completed'
    node.completed_at = func.now()

    # 3. 自动插入“业主反馈”日志
    feedback_text = content if content else "业主已确认通过验收"
    new_log = DBProjectLog(
        project_id=current_project.id,
        node_id=node_id,
        content=feedback_text,
        sender_type="client",
        operator="业主",
        created_at=func.now()
    )
    db.add(new_log)

    # 4. 联动更新项目总进度：如果该节点的权重高于当前进度，则自动推进
    if node.target_percent > current_project.current_progress:
        current_project.current_progress = node.target_percent

    await db.commit()
    return {
        "status": "success",
        "new_progress": current_project.current_progress,
        "message": f"节点【{node.node_name}】已确认验收"
    }


# ==========================================
# 3. 沟通日记 (业主留言)
# ==========================================

@router.post("/project/message")
async def send_client_message(
        content: str = Body(..., embed=True),
        db: AsyncSession = Depends(get_db),
        current_project: DBProject = Depends(client_required)
):
    """
    业主发送沟通消息。
    务实：直接存入 project_logs，node_id 设为 null 表示全局消息。
    """
    if not content.strip():
        raise HTTPException(status_code=400, detail="内容不能为空")

    new_log = DBProjectLog(
        project_id=current_project.id,
        content=content.strip(),
        sender_type="client",
        operator="业主",
        node_id=None
    )
    db.add(new_log)
    await db.commit()

    return {"status": "success", "message": "留言已发送"}