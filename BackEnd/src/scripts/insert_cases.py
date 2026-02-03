# backend/scripts/insert_cases.py
import asyncio
import json
import os
import sys
from pathlib import Path

# 1. 动态定位并添加项目根目录，确保导入不报错
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

# 2. 引入异步组件与模型
from src.database import AsyncSessionLocal, DBCase
from sqlalchemy import select

async def insert_real_cases():
    """
    异步插入真实案例数据
    务实逻辑：避免同步锁死，确保数据结构对齐
    """
    async with AsyncSessionLocal() as db:
        try:
            print("🚀 [Database] 开始异步插入案例数据...")

            # 定位 JSON 数据文件
            data_file = backend_dir.parent / 'data' / 'sample_cases.json'
            if not data_file.exists():
                print(f"❌ 错误：找不到数据文件 {data_file}")
                return

            with open(data_file, 'r', encoding='utf-8') as f:
                cases_data = json.load(f)

            inserted_count = 0
            for case_data in cases_data:
                # 3. 使用异步语法检查是否已存在 (根据 slug 判定)
                stmt = select(DBCase).where(DBCase.slug == case_data['slug'])
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()

                if existing:
                    print(f"  ⏩ 跳过已存在案例: {case_data.get('chinese_title')}")
                    continue

                # 4. 构造模型实例 (仅保留数据库中存在的字段)
                # 注意：此处自动过滤了旧脚本中多余的字段
                db_case = DBCase(
                    slug=case_data['slug'],
                    title=case_data['title'],
                    chinese_title=case_data['chinese_title'],
                    description=case_data.get('description'),
                    detailed_description=case_data.get('detailed_description'),
                    location=case_data.get('location'),
                    area=case_data.get('area', 0),
                    year=case_data.get('year'),
                    categories=case_data.get('categories', []),
                    styles=case_data.get('styles', []),
                    images=case_data.get('images', []),
                    featured=case_data.get('featured', False),
                    status=case_data.get('status', 'completed')
                )

                db.add(db_case)
                inserted_count += 1
                print(f"  ✅ 预备添加: {case_data.get('chinese_title')}")

            # 5. 执行异步提交
            await db.commit()
            print(f"\n🎉 成功异步插入 {inserted_count} 个案例！")

        except Exception as e:
            await db.rollback()
            print(f"💥 插入数据失败: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    # 使用 asyncio 运行异步入口
    asyncio.run(insert_real_cases())