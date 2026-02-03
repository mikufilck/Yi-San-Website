# BackEnd/src/middleware/error_handler.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import traceback
import logging

from ..config import settings 

# 配置基础日志，用于在后台控制台输出错误详情
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("API_ERROR")

async def error_handler_middleware(request: Request, call_next):
    """
    全局错误处理中间件
    区分业务异常与系统崩溃，在开发环境下暴露详情，生产环境下隐藏细节。
    """
    try:
        response = await call_next(request)
        return response
    except HTTPException as http_exc:
        # 1. 处理已知的业务异常 (如 401, 403, 404)
        return JSONResponse(
            status_code=http_exc.status_code,
            content={
                "error": {
                    "code": http_exc.status_code,
                    "message": http_exc.detail,
                    "type": "BusinessLogicException"
                }
            }
        )
    except Exception as exc:
        # 2. 处理未知的系统崩溃 (500 错误)
        # 在控制台输出完整的错误堆栈，方便调试
        logger.error(f"💥 系统严重错误: {traceback.format_exc()}")

        # 非生产环境下返回具体的报错内容，生产环境下仅返回模糊提示
        error_detail = str(exc) if not settings.IS_PROD else "服务器内部错误，请联系管理员 / Internal Server Error"

        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": 500,
                    "message": "服务器繁忙，请稍后再试",
                    "type": "InternalServerError",
                    "detail": error_detail
                }
            }
        )
