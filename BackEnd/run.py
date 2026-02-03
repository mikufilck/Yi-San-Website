# backend/run.py
import uvicorn
import sys
import os


def main():
    """主启动函数"""
    print("🚀 启动一三设计案例系统后端...")
    print("📚 API 文档: http://localhost:8000/docs")
    print("📊 健康检查: http://localhost:8000/api/health")
    print("💾 数据库: PostgreSQL")
    print("=" * 50)

    # 添加当前目录到路径
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)

    try:
        # 启动服务 - 使用module导入方式
        uvicorn.run(
            "src.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=["src"],
            log_level="info",
            env_file = ".env"  # 👈 告诉 uvicorn 启动子进程时加载这个文件
        )
    except KeyboardInterrupt:
        print("\n👋 服务已停止")
    except Exception as e:
        print(f"❌ 启动服务器时出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()