# backend/scripts/setup_postgres.ps1 (Windows)
Write-Host "🔧 PostgreSQL 数据库设置脚本" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 检查 psql 是否安装
try {
    $psqlPath = Get-Command psql -ErrorAction Stop
    Write-Host "✅ 找到 psql: $($psqlPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 psql 命令，请确保 PostgreSQL 已安装" -ForegroundColor Red
    exit 1
}

Write-Host "1. 连接到 PostgreSQL..." -ForegroundColor Yellow
Write-Host "   默认用户: postgres" -ForegroundColor Yellow
Write-Host "   默认数据库: postgres" -ForegroundColor Yellow

# 创建数据库
Write-Host "2. 创建数据库 'design_cases_db'..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE design_cases_db;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  数据库可能已存在，继续..." -ForegroundColor Yellow
}

Write-Host "3. 创建表并插入示例数据..." -ForegroundColor Yellow
python src/init_postgres.py

Write-Host "✅ 数据库设置完成！" -ForegroundColor Green