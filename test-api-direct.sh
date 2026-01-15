#!/bin/bash

echo "🧪 测试 Gitee AI API"
echo ""

# 测试 1: 查询配额
echo "📊 测试 1: 查询配额"
curl -s http://localhost:3000/api/gitee-ai | jq '.'
echo ""
echo "---"
echo ""

# 测试 2: 最简单的生成请求
echo "🎨 测试 2: 最简单的生成请求"
curl -s -X POST http://localhost:3000/api/gitee-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"一只猫"}' | jq '.'
echo ""
echo "---"
echo ""

# 测试 3: 完整参数的生成请求
echo "🎨 测试 3: 完整参数的生成请求"
curl -s -X POST http://localhost:3000/api/gitee-ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的小猫",
    "model": "z-image-turbo",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "image_scale": 1,
    "negative_prompt": "blurry ugly bad"
  }' | jq '.'
