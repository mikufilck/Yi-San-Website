# backend/src/services/category_service.py
from typing import Dict, List, Optional

class CategoryService:
    """
    分类映射服务
    解耦前端展示层 Slug 与后端存储层 Label。
    """

    # 前端 Slug 到后端数据库 Label 的映射
    # 前端需要 SEO 友好的长路径，后端数据库倾向于简洁的枚举值
    _MAP: Dict[str, str] = {
        "office-public": "office",
        "residential": "residential",
        "commercial": "commercial",
        "old-building-renovation": "renovation", # 对应 database 中的标签
        "hotel-vacation": "hospitality",
        "exhibition-hall": "cultural",
    }

    # 中文名称映射，用于 UI 渲染
    _DISPLAY_NAMES: Dict[str, str] = {
        "office-public": "办公公共",
        "residential": "住宅人居",
        "commercial": "商业零售",
        "old-building-renovation": "旧建筑改造",
        "hotel-vacation": "酒店度假",
        "exhibition-hall": "展会展厅",
    }

    @classmethod
    def frontend_to_backend(cls, frontend_slug: str) -> Optional[str]:
        """将前端路径参数转换为数据库查询参数"""
        return cls._MAP.get(frontend_slug)

    @classmethod
    def get_all_categories(cls) -> List[Dict[str, str]]:
        """
        获取全部分类元数据
        适配前端：CasesPage.tsx 的 FilterBar
        """
        return [
            {
                "slug": slug,
                "label": cls._DISPLAY_NAMES.get(slug, slug),
                "backend_value": backend
            }
            for slug, backend in cls._MAP.items()
        ]

    @staticmethod
    def get_chinese_name(slug: str) -> str:
        """获取前端 Slug 对应的中文名"""
        return CategoryService._DISPLAY_NAMES.get(slug, slug)
