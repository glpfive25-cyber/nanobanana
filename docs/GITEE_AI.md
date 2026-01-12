# Gitee AI 图片生成接口

## 概述

Gitee AI 提供基于 z-image-turbo 模型的图片生成服务。

## ⚠️ 重要限制

**每天限量生成 100 张图片**

- 每日配额：100 张
- 重置时间：每天 00:00
- 超过限额后需等待第二天
- 建议合理规划使用

## API 端点

### 生成图片

```
POST /api/gitee-ai
```

### 查询配额

```
GET /api/gitee-ai
```

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `prompt` | string | 是 | - | 图片描述文字 |
| `model` | string | 否 | z-image-turbo | 模型名称 |
| `negative_prompt` | string | 否 | blurry ugly bad | 负面提示词 |
| `num_inference_steps` | number | 否 | 9 | 推理步数 |
| `guidance_scale` | number | 否 | 1 | 引导强度 |
| `control_image` | string | 否 | - | 控制图像（base64） |
| `control_mode` | string | 否 | HED | 控制模式 |
| `control_context_scale` | number | 否 | 0.75 | 控制上下文比例 |
| `image_scale` | number | 否 | 1 | 图像缩放 |

## 使用示例

### 方法一：使用 OpenAI SDK（推荐）

Gitee AI 完全兼容 OpenAI SDK，可以直接使用：

#### Python

```python
from openai import OpenAI
import base64
import requests

# 创建客户端
client = OpenAI(
    base_url="https://ai.gitee.com/v1",
    api_key="your_api_key_here",
)

# 生成图片
response = client.images.generate(
    prompt="一只可爱的猫咪坐在窗台上",
    model="z-image-turbo",
    extra_body={
        "negative_prompt": "blurry ugly bad",
        "num_inference_steps": 9,
        "guidance_scale": 1,
        "image_scale": 1,
    }
)

# 处理响应
for i, image_data in enumerate(response.data):
    if image_data.url:
        # 从 URL 下载
        ext = image_data.url.split('.')[-1].split('?')[0] or "jpg"
        filename = f"output-{i}.{ext}"
        
        img_response = requests.get(image_data.url, timeout=30)
        img_response.raise_for_status()
        
        with open(filename, "wb") as f:
            f.write(img_response.content)
        
        print(f"Downloaded image to {filename}")
        
    elif image_data.b64_json:
        # 解码 base64
        image_bytes = base64.b64decode(image_data.b64_json)
        filename = f"output-{i}.jpg"
        
        with open(filename, "wb") as f:
            f.write(image_bytes)
        
        print(f"Saved image to {filename}")
```

#### 使用控制图像（图生图）

```python
# 读取控制图像
with open("input.jpg", "rb") as f:
    image_bytes = f.read()
    control_image_b64 = base64.b64encode(image_bytes).decode('utf-8')

# 生成图片
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
```

### 方法二：通过我们的代理接口

#### cURL 命令

```bash
curl http://localhost:3000/api/gitee-ai \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A woman dressed in casual denim jeans and a fitted tank top standing in the vibrant cityscape of Dubai",
    "model": "z-image-turbo",
    "negative_prompt": "blurry ugly bad",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "image_scale": 1
  }'
```

### 使用控制图像

```bash
curl http://localhost:3000/api/gitee-ai \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "迪拜城市景观中的时尚女性",
    "model": "z-image-turbo",
    "negative_prompt": "blurry ugly bad",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "control_image": "图片的 base64 编码字符串",
    "control_mode": "HED",
    "control_context_scale": 0.75,
    "image_scale": 1
  }'
```

### 查询配额

```bash
curl http://localhost:3000/api/gitee-ai
```

响应示例：
```json
{
  "quota": {
    "used": 25,
    "remaining": 75,
    "limit": 100,
    "date": "Mon Jan 12 2026",
    "resetTime": "明天 00:00"
  }
}
```

### JavaScript/TypeScript

```typescript
// 生成图片
const response = await fetch('/api/gitee-ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '迪拜城市景观中的时尚女性',
    model: 'z-image-turbo',
    negative_prompt: 'blurry ugly bad',
    num_inference_steps: 9,
    guidance_scale: 1
  })
})

const data = await response.json()

if (response.ok) {
  console.log('生成成功:', data)
  console.log('剩余配额:', data.quota.remaining)
} else {
  console.error('生成失败:', data.error)
}

// 查询配额
const quotaResponse = await fetch('/api/gitee-ai')
const quotaData = await quotaResponse.json()
console.log('当前配额:', quotaData.quota)
```

## 响应格式

### 成功响应

```json
{
  "data": [
    {
      "url": "https://...",
      "b64_json": "..."
    }
  ],
  "quota": {
    "used": 26,
    "remaining": 74,
    "limit": 100,
    "resetTime": "明天 00:00"
  }
}
```

### 超过限额

```json
{
  "error": "已达到每日生成限额",
  "code": "DAILY_LIMIT_EXCEEDED",
  "message": "每天限量生成 100 张图片，今日配额已用完",
  "remaining": 0,
  "limit": 100,
  "resetTime": "明天 00:00",
  "suggestion": "请明天再来，或联系管理员增加配额"
}
```

HTTP 状态码：`429 Too Many Requests`

### 错误响应

```json
{
  "error": "请提供图片描述"
}
```

## 环境变量配置

在 `.env.local` 文件中配置：

```env
# Gitee AI API Key（可选，代码中有默认值）
GITEE_AI_API_KEY=your_api_key_here
```

## 控制模式说明

`control_mode` 支持以下模式：

- `HED`：边缘检测
- `Canny`：Canny 边缘检测
- `Depth`：深度图
- `Normal`：法线图
- `Pose`：姿态检测
- `Scribble`：涂鸦

## 最佳实践

1. **合理使用配额**
   - 每天只有 100 张限额
   - 建议先测试小批量
   - 避免重复生成相同内容

2. **优化提示词**
   - 使用清晰具体的描述
   - 添加风格和细节要求
   - 使用负面提示词排除不想要的元素

3. **参数调整**
   - `num_inference_steps`：步数越多质量越好，但速度越慢
   - `guidance_scale`：控制提示词的影响强度
   - 建议使用默认值开始测试

4. **错误处理**
   - 检查响应状态码
   - 处理配额超限情况
   - 实现重试机制

## 注意事项

1. **配额管理**
   - 当前使用内存存储，服务重启会重置计数
   - 生产环境建议使用数据库或 Redis
   - 可以根据需要调整每日限额

2. **API Key 安全**
   - 不要在前端暴露 API Key
   - 使用环境变量存储
   - 定期更换密钥

3. **性能优化**
   - 图片生成需要时间，建议显示加载状态
   - 可以实现队列机制
   - 考虑添加缓存

## 升级配额

如需增加每日配额，请修改 `app/api/gitee-ai/route.ts` 中的 `DAILY_LIMIT` 常量：

```typescript
const DAILY_LIMIT = 100  // 修改为你需要的数量
```

## 故障排查

### 问题：超过限额

**解决方案**：
- 等待第二天 00:00 自动重置
- 或联系管理员增加配额

### 问题：生成失败

**可能原因**：
- API Key 无效
- 提示词包含敏感内容
- 网络连接问题

**解决方案**：
- 检查 API Key 配置
- 修改提示词内容
- 查看服务器日志

### 问题：响应缓慢

**解决方案**：
- 减少 `num_inference_steps`
- 使用更简洁的提示词
- 检查网络状况

## 相关链接

- [Gitee AI 官网](https://ai.gitee.com/)
- [API 文档](https://ai.gitee.com/docs)

## 更新日志

- **2026-01-12**：创建 Gitee AI 接口，添加每日 100 张限额
