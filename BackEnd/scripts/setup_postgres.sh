# backend/scripts/setup_postgres.sh
#!/bin/bash

echo "🔧 PostgreSQL 数据库设置脚本"
echo "============================="

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
    echo "❌ 未找到 psql 命令，请确保 PostgreSQL 已安装"
    exit 1
fi

echo "1. 连接到 PostgreSQL..."
echo "   默认用户: postgres"
echo "   默认数据库: postgres"

# 创建数据库
echo "2. 创建数据库 'design_cases_db'..."
psql -U postgres -c "CREATE DATABASE design_cases_db;" || {
    echo "⚠️  数据库可能已存在，继续..."
}

echo "3. 创建表并插入示例数据..."
python src/init_postgres.py

echo "✅ 数据库设置完成！"