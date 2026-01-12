#!/usr/bin/env python3
"""
Gitee AI 官方 SDK 测试脚本
使用 OpenAI SDK 调用 Gitee AI 接口
"""

import os
import base64
import requests
from openai import OpenAI

# 配置
API_KEY = os.getenv('GITEE_AI_API_KEY', 'W593PWIER85HX7EQTVXXCVZ28Y4HAHJR4COYXPJZ')
BASE_URL = "https://ai.gitee.com/v1"

def test_gitee_ai_direct():
    """直接使用 OpenAI SDK 测试 Gitee AI"""
    print("=" * 60)
    print("测试 Gitee AI - 使用 OpenAI SDK")
    print("=" * 60)
    print()
    
    # 创建客户端
    client = OpenAI(
        base_url=BASE_URL,
        api_key=API_KEY,
    )
    
    # 测试提示词
    prompts = [
        "一只可爱的猫咪坐在窗台上",
        "A beautiful sunset over the ocean",
        "迪拜城市景观中的时尚女性"
    ]
    
    for i, prompt in enumerate(prompts, 1):
        print(f"\n{i}. 测试提示词: {prompt}")
        print("-" * 60)
        
        try:
            # 调用 API
            response = client.images.generate(
                prompt=prompt,
                model="z-image-turbo",
                extra_body={
                    "negative_prompt": "blurry ugly bad",
                    "num_inference_steps": 9,
                    "guidance_scale": 1,
                    "image_scale": 1,
                }
            )
            
            # 处理响应
            for j, image_data in enumerate(response.data):
                if image_data.url:
                    # 从 URL 下载
                    print(f"   ✅ 图片 {j+1} URL: {image_data.url[:50]}...")
                    
                    # 下载图片
                    ext = image_data.url.split('.')[-1].split('?')[0] or "jpg"
                    filename = f"gitee-ai-{i}-{j}.{ext}"
                    
                    img_response = requests.get(image_data.url, timeout=30)
                    img_response.raise_for_status()
                    
                    with open(filename, "wb") as f:
                        f.write(img_response.content)
                    
                    print(f"   💾 已保存到: {filename}")
                    
                elif image_data.b64_json:
                    # 解码 base64
                    print(f"   ✅ 图片 {j+1} (base64)")
                    
                    image_bytes = base64.b64decode(image_data.b64_json)
                    filename = f"gitee-ai-{i}-{j}.jpg"
                    
                    with open(filename, "wb") as f:
                        f.write(image_bytes)
                    
                    print(f"   💾 已保存到: {filename}")
            
            print(f"   ✅ 生成成功")
            
        except Exception as e:
            print(f"   ❌ 生成失败: {e}")
        
        print()

def test_with_control_image():
    """测试带控制图像的生成"""
    print("\n" + "=" * 60)
    print("测试 Gitee AI - 带控制图像")
    print("=" * 60)
    print()
    
    # 这里需要一个实际的图片文件
    # 示例代码，实际使用时需要提供图片
    print("⚠️  控制图像测试需要提供实际图片文件")
    print("示例代码：")
    print("""
    # 读取图片并转换为 base64
    with open("input.jpg", "rb") as f:
        image_bytes = f.read()
        control_image_b64 = base64.b64encode(image_bytes).decode('utf-8')
    
    # 调用 API
    client = OpenAI(base_url=BASE_URL, api_key=API_KEY)
    response = client.images.generate(
        prompt="转换为卡通风格",
        model="z-image-turbo",
        extra_body={
            "negative_prompt": "blurry ugly bad",
            "num_inference_steps": 9,
            "guidance_scale": 1,
            "control_image": control_image_b64,
            "control_mode": "HED",
            "control_context_scale": 0.75,
            "image_scale": 1,
        }
    )
    """)

def main():
    print("\n🚀 Gitee AI 官方 SDK 测试\n")
    
    # 检查依赖
    try:
        import openai
        print(f"✅ OpenAI SDK 版本: {openai.__version__}")
    except ImportError:
        print("❌ 未安装 OpenAI SDK")
        print("请运行: pip install openai")
        return
    
    print(f"✅ API Key: {API_KEY[:20]}...")
    print(f"✅ Base URL: {BASE_URL}")
    print()
    
    # 运行测试
    test_gitee_ai_direct()
    test_with_control_image()
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("=" * 60)
    print()
    print("💡 提示：")
    print("- 每天限量 100 张图片")
    print("- 生成的图片保存在当前目录")
    print("- 可以使用控制图像进行图生图")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  测试已中断")
    except Exception as e:
        print(f"\n❌ 测试出错: {e}")
