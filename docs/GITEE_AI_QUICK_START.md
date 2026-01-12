# Gitee AI 快速开始

## ⚠️ 重要提示

**每天限量 100 张图片！**

## 快速测试

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试接口

#### 方法一：使用 cURL

```bash
# 查询配额
curl http://localhost:3000/api/gitee-ai

# 生成图片
curl http://localhost:3000/api/gitee-ai \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的猫咪",
    "model": "z-image-turbo"
  }'
```

#### 方法二：使用测试脚本

```bash
# Bash 脚本（推荐）
./scripts/test-gitee-ai.sh

# Python 脚本
python3 scripts/test-gitee-ai.py
```

## 配额管理

### 查看当前配额

```bash
curl http://localhost:3000/api/gitee-ai
```

响应：
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

### 配额超限

当达到每日限额时，API 返回：

```json
{
  "error": "已达到每日生成限额",
  "code": "DAILY_LIMIT_EXCEEDED",
  "remaining": 0,
  "limit": 100
}
```

HTTP 状态码：`429 Too Many Requests`

## 参数说明

### 必填参数

- `prompt`: 图片描述（字符串）

### 可选参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `model` | z-image-turbo | 模型名称 |
| `negative_prompt` | blurry ugly bad | 负面提示词 |
| `num_inference_steps` | 9 | 推理步数 |
| `guidance_scale` | 1 | 引导强度 |
| `image_scale` | 1 | 图像缩放 |

## 示例代码

### JavaScript

```javascript
async function generateImage(prompt) {
  const response = await fetch('/api/gitee-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
  
  const data = await response.json()
  
  if (response.status === 429) {
    alert('今日配额已用完，请明天再来！')
    return
  }
  
  console.log('剩余配额:', data.quota.remaining)
  return data
}
```

### Python

```python
import requests

def generate_image(prompt):
    response = requests.post(
        'http://localhost:3000/api/gitee-ai',
        json={'prompt': prompt}
    )
    
    if response.status_code == 429:
        print('今日配额已用完！')
        return None
    
    data = response.json()
    print(f"剩余配额: {data['quota']['remaining']}")
    return data
```

## 最佳实践

1. **先查询配额**：生成前先检查剩余配额
2. **批量处理**：合理规划，避免浪费配额
3. **错误处理**：处理 429 状态码
4. **监控使用**：定期查看配额使用情况

## 调整配额

修改 `app/api/gitee-ai/route.ts`：

```typescript
const DAILY_LIMIT = 100  // 改为你需要的数量
```

## 常见问题

**Q: 配额什么时候重置？**  
A: 每天 00:00 自动重置

**Q: 服务重启会影响配额吗？**  
A: 当前使用内存存储，重启会重置。生产环境建议使用数据库。

**Q: 如何增加配额？**  
A: 修改代码中的 `DAILY_LIMIT` 常量

## 更多信息

详细文档：[docs/GITEE_AI.md](./GITEE_AI.md)
