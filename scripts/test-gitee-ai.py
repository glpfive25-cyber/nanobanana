#!/usr/bin/env python3
"""
Gitee AI 图片生成接口测试脚本
每天限量 100 张图片
"""

import requests
import json
import sys

BASE_URL = "http://localhost:3000"

def print_header(text):
    """打印标题"""
    print("\n" + "=" * 50)
    print(text)
    print("=" * 50 + "\n")

def print_section(text):
    """打印章节"""
    print(f"\n{text}")
    print("-" * 50)

def get_quota():
    """查询当前配额"""
    try:
        response = requests.get(f"{BASE_URL}/api/gitee-ai")
        return response.json()
    except Exception as e:
        print(f"❌ 查询配额失败: {e}")
        return None

def generate_image(prompt, **kwargs):
    """生成图片"""
    data = {
        "prompt": prompt,
        "model": kwargs.get("model", "z-image-turbo"),
        "negative_prompt": kwargs.get("negative_prompt", "blurry ugly bad"),
        "num_inference_steps": kwargs.get("num_inference_steps", 9),
        "guidance_scale": kwargs.get("guidance_scale", 1),
        "image_scale": kwargs.get("image_scale", 1)
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/gitee-ai",
            headers={"Content-Type": "application/json"},
            json=data
        )
        return response.status_code, response.json()
    except Exception as e:
        print(f"❌ 生成失败: {e}")
        return None, None

def main():
    print_header("Gitee AI 图片生成接口测试\n每日限额：100 张")
    
    # 1. 查询初始配额
    print_section("1. 查询初始配额")
    quota = get_quota()
    if quota:
        print(json.dumps(quota, indent=2, ensure_ascii=False))
        initial_used = quota.get("quota", {}).get("used", 0)
        initial_remaining = quota.get("quota", {}).get("remaining", 0)
        print(f"\n📊 已使用: {initial_used} | 剩余: {initial_remaining}")
    
    # 2. 生成图片 - 英文提示词
    print_section("2. 生成图片（英文提示词）")
    status, result = generate_image(
        "A beautiful sunset over the ocean with vibrant colors"
    )
    if result:
        if status == 200:
            print("✅ 生成成功")
            if "quota" in result:
                q = result["quota"]
                print(f"📊 配额: 已用 {q['used']} | 剩余 {q['remaining']}")
        else:
            print(f"❌ 生成失败 (状态码: {status})")
            print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 3. 生成图片 - 中文提示词
    print_section("3. 生成图片（中文提示词）")
    status, result = generate_image(
        "一只可爱的猫咪坐在窗台上，阳光洒在它身上，温暖的氛围",
        negative_prompt="模糊 丑陋 低质量"
    )
    if result:
        if status == 200:
            print("✅ 生成成功")
            if "quota" in result:
                q = result["quota"]
                print(f"📊 配额: 已用 {q['used']} | 剩余 {q['remaining']}")
        else:
            print(f"❌ 生成失败 (状态码: {status})")
            print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 4. 生成图片 - 迪拜示例
    print_section("4. 生成图片（迪拜城市景观）")
    status, result = generate_image(
        "A woman dressed in casual denim jeans and a fitted tank top "
        "standing in the vibrant cityscape of Dubai. Her style embodies "
        "contemporary Middle Eastern fashion with modern urban elements."
    )
    if result:
        if status == 200:
            print("✅ 生成成功")
            if "quota" in result:
                q = result["quota"]
                print(f"📊 配额: 已用 {q['used']} | 剩余 {q['remaining']}")
        else:
            print(f"❌ 生成失败 (状态码: {status})")
            print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 5. 查询最终配额
    print_section("5. 查询最终配额")
    quota = get_quota()
    if quota:
        print(json.dumps(quota, indent=2, ensure_ascii=False))
        q = quota.get("quota", {})
        used = q.get("used", 0)
        remaining = q.get("remaining", 0)
        limit = q.get("limit", 100)
        
        print_header("测试完成！")
        print(f"📊 已使用: {used} / {limit}")
        print(f"📊 剩余: {remaining}")
        
        if remaining < 10:
            print("\n⚠️  警告：配额即将用完！")
        elif remaining < 50:
            print("\n⚠️  注意：配额已使用过半")
        else:
            print("\n✅ 配额充足")
        
        print(f"\n🔄 重置时间: {q.get('resetTime', '明天 00:00')}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  测试已中断")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 测试出错: {e}")
        sys.exit(1)
