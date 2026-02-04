# Yi-San-Website
厦门一叁设计有限公司官方网站

# 后端配置
cd BackEnd
python -m venv .venv
source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
pip install -r requirements.txt
## env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/design_cases_db
SECRET_KEY=你的加密密钥
MAIL_PASSWORD=你的邮件授权码

# 数据库初始化
## Windows
./scripts/setup_postgres.ps1

## Linux/macOS
chmod +x ./scripts/setup_postgres.sh
./scripts/setup_postgres.sh

# 许可证
本项目采用 AGPL v3.0 协议开源。任何对本项目的修改及派生作品，在提供网络服务时均须公开源码。
