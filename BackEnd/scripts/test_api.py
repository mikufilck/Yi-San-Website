# backend/scripts/test_api.py
import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    """测试健康检查"""
    response = requests.get(f"{BASE_URL}/api/health")
    print("健康检查:", response.status_code, response.json())
    return response.status_code == 200


def test_get_cases():
    """测试获取案例"""
    # 测试基本分页
    response = requests.get(f"{BASE_URL}/api/cases/?page=1&size=5")
    print("获取案例（分页）:", response.status_code)
    data = response.json()
    print(f"  总数: {data['total']}, 页数: {data['pages']}, 当前数量: {len(data['items'])}")

    # 测试分类筛选
    response = requests.get(f"{BASE_URL}/api/cases/?category=office-public")
    print("按分类筛选:", response.status_code)

    # 测试多个筛选条件
    response = requests.get(f"{BASE_URL}/api/cases/?year_from=2022&featured=true")
    print("多条件筛选:", response.status_code)

    return response.status_code == 200


def test_get_categories():
    """测试获取分类"""
    response = requests.get(f"{BASE_URL}/api/cases/categories/")
    print("获取分类:", response.status_code)
    data = response.json()
    print(f"  分类数量: {len(data['categories'])}")
    for cat in data['categories']:
        print(f"  - {cat['slug']}: {cat['chinese_name']}")
    return response.status_code == 200


def test_by_category():
    """测试按分类获取案例"""
    response = requests.get(f"{BASE_URL}/api/cases/by-category/office-public?page=1&size=5")
    print("按分类slug获取:", response.status_code)
    return response.status_code == 200


def main():
    """运行所有测试"""
    print("🚀 API接口测试开始")
    print("=" * 50)

    tests = [
        ("健康检查", test_health),
        ("获取分类", test_get_categories),
        ("获取案例", test_get_cases),
        ("按分类获取", test_by_category),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success, "✓" if success else "✗"))
        except Exception as e:
            results.append((test_name, False, f"✗ (错误: {e})"))

    print("\n📊 测试结果:")
    print("=" * 50)
    for test_name, success, symbol in results:
        print(f"{symbol} {test_name}: {'通过' if success else '失败'}")

    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    print(f"\n✅ 通过: {passed}/{total}")

    return all(success for _, success, _ in results)


if __name__ == "__main__":
    import sys

    success = main()
    sys.exit(0 if success else 1)