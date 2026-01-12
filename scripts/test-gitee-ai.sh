#!/bin/bash

# Gitee AI 接口测试脚本
# 每天限量 100 张图片

BASE_URL="http://localhost:3000"

echo "======================================"
echo "Gitee AI 图片生成接口测试"
echo "每日限额：100 张"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 查询当前配额
echo "1. 查询当前配额..."
echo "-----------------------------------"
curl -s "${BASE_URL}/api/gitee-ai" | jq '.'
echo ""
echo ""

# 2. 生成图片（基础示例）
echo "2. 生成图片（基础示例）..."
echo "-----------------------------------"
curl -s "${BASE_URL}/api/gitee-ai" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over the ocean with vibrant colors",
    "model": "z-image-turbo",
    "negative_prompt": "blurry ugly bad",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "image_scale": 1
  }' | jq '.'
echo ""
echo ""

# 3. 生成图片（中文提示词）
echo "3. 生成图片（中文提示词）..."
echo "-----------------------------------"
curl -s "${BASE_URL}/api/gitee-ai" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的猫咪坐在窗台上，阳光洒在它身上，温暖的氛围",
    "model": "z-image-turbo",
    "negative_prompt": "模糊 丑陋 低质量",
    "num_inference_steps": 9,
    "guidance_scale": 1
  }' | jq '.'
echo ""
echo ""

# 4. 再次查询配额（应该增加了）
echo "4. 再次查询配额..."
echo "-----------------------------------"
curl -s "${BASE_URL}/api/gitee-ai" | jq '.'
echo ""
echo ""

# 5. 生成图片（迪拜示例）
echo "5. 生成图片（迪拜城市景观）..."
echo "-----------------------------------"
curl -s "${BASE_URL}/api/gitee-ai" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A woman dressed in casual denim jeans and a fitted tank top standing in the vibrant cityscape of Dubai. Her style embodies contemporary Middle Eastern fashion with modern urban elements.",
    "model": "z-image-turbo",
    "negative_prompt": "blurry ugly bad",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "image_scale": 1
  }' | jq '.'
echo ""
echo ""

# 6. 最终配额状态
echo "6. 最终配额状态..."
echo "-----------------------------------"
QUOTA_RESPONSE=$(curl -s "${BASE_URL}/api/gitee-ai")
echo "$QUOTA_RESPONSE" | jq '.'

# 提取并显示配额信息
USED=$(echo "$QUOTA_RESPONSE" | jq -r '.quota.used')
REMAINING=$(echo "$QUOTA_RESPONSE" | jq -r '.quota.remaining')
LIMIT=$(echo "$QUOTA_RESPONSE" | jq -r '.quota.limit')

echo ""
echo "======================================"
echo -e "${GREEN}测试完成！${NC}"
echo "======================================"
echo -e "已使用：${YELLOW}${USED}${NC} / ${LIMIT}"
echo -e "剩余：${GREEN}${REMAINING}${NC}"
echo ""

if [ "$REMAINING" -lt 10 ]; then
  echo -e "${RED}⚠️  警告：配额即将用完！${NC}"
elif [ "$REMAINING" -lt 50 ]; then
  echo -e "${YELLOW}⚠️  注意：配额已使用过半${NC}"
else
  echo -e "${GREEN}✓ 配额充足${NC}"
fi

echo ""
