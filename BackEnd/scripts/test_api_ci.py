# BackEnd/scripts/test_api_ci.py
import requests, sys, time

BASE_URL = "http://localhost:8000/api"

def run_ci_test():
    time.sleep(2) # 等待 Uvicorn 启动
    try:
        checks = [
            requests.get(f"{BASE_URL}/health").status_code == 200,
            requests.get(f"{BASE_URL}/cases/categories").status_code == 200,
            requests.get(f"{BASE_URL}/cases/?page=1&size=1").status_code == 200
        ]
        return all(checks)
    except:
        return False

if __name__ == "__main__":
    sys.exit(0 if run_ci_test() else 1)
