# Gitee AI 配置指南

## ⚠️ 重要提示

**默认的 API Key 已失效！** 你必须配置自己的 API Key 才能使用 Gitee AI 功能。

## 🚀 快速开始

### 1. 获取 API Key

访问 [Gitee AI](https://ai.gitee.com) 并按以下步骤操作：

1. 注册/登录 Gitee 账号
2. 进入 API 管理页面
3. 创建新的 API Key
4. 复制生成的 Key（格式类似：`XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`）

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
# 单个 Key（适合个人使用）
GITEE_AI_API_KEYS=你的API_Key

# 或者多个 Key（推荐，突破配额限制）
GITEE_AI_API_KEYS=key1,key2,key3,key4,key5
```

### 3. 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 4. 测试

访问 `/nano` 页面，选择 "Gitee AI" 模型，输入描述并生成。

## 📋 完整配置示例

### .env.local 文件

```env
# =====================================================
# Gitee AI 配置
# =====================================================

# 方式 1: 单个 Key（每天 100 张）
GITEE_AI_API_KEYS=W593PWIER85HX7EQTVXXCVZ28Y4HAHJR4COYXPJZ

# 方式 2: 多个 Key（推荐，每天 500 张）
GITEE_AI_API_KEYS=key1_from_account1,key2_from_account2,key3_from_account3,key4_from_account4,key5_from_account5

# 方式 3: 多行格式（更易读）
GITEE_AI_API_KEYS=\
  W593PWIER85HX7EQTVXXCVZ28Y4HAHJR4COYXPJZ,\
  ANOTHER_KEY_HERE_XXXXXXXXXXXXXXXXXXXXXXXX,\
  YET_ANOTHER_KEY_XXXXXXXXXXXXXXXXXXXXX

# =====================================================
# 其他 API 配置
# =====================================================

# Gemini API（可选）
GEMINI_API_KEY=your_gemini_key_here

# Maynor API（可选）
MAYNOR_API_KEY=your_maynor_key_here
MAYNOR_API_URL=https://for.shuo.bar
```

## 🧪 测试 API Key

### 方法 1: 使用 curl 测试

```bash
# 替换 YOUR_API_KEY 为你的实际 Key
curl https://ai.gitee.com/v1/images/generations \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "一只可爱的小猫",
    "model": "z-image-turbo",
    "negative_prompt": "blurry ugly bad",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "image_scale": 1
  }'
```

**成功响应示例：**
```json
{
  "data": [
    {
      "url": "https://...",
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

**失败响应示例：**
```json
{
  "error": {
    "code": "400",
    "message": "您的"免费体验访问令牌"已达到最大使用额"
  }
}
```

### 方法 2: 使用测试脚本

```bash
# 确保服务器正在运行
npm run dev

# 在另一个终端运行测试
node test-gitee-ai.js
```

### 方法 3: 使用测试页面

访问：`http://localhost:3000/gitee-ai-test`

## ❌ 常见错误

### 错误 1: "未配置 API Key"

**错误信息：**
```json
{
  "error": "未配置 API Key",
  "code": "NO_API_KEY",
  "message": "请在 .env.local 中配置 GITEE_AI_API_KEYS"
}
```

**解决方法：**
1. 检查 `.env.local` 文件是否存在
2. 确认已添加 `GITEE_AI_API_KEYS=your_key`
3. 重启开发服务器

### 错误 2: "API Key 配额已用完"

**错误信息：**
```json
{
  "error": "API Key 配额已用完",
  "code": "API_QUOTA_EXCEEDED",
  "message": "您的"免费体验访问令牌"已达到最大使用额"
}
```

**解决方法：**
1. 使用新的 Gitee 账号获取新的 API Key
2. 配置多个 API Key 实现轮询
3. 等待配额重置（通常是每天重置）

### 错误 3: "请提供图片描述"

**错误信息：**
```json
{
  "error": "请提供图片描述",
  "received": ["model", "timestamp", ...]
}
```

**解决方法：**
- 确保输入了描述文字
- 检查前端是否正确传递了 `prompt` 参数

### 错误 4: 400 Bad Request

**可能原因：**
1. API Key 无效或已过期
2. API Key 配额已用完
3. 请求参数格式错误

**解决方法：**
1. 验证 API Key 是否正确
2. 使用 curl 直接测试 API Key
3. 检查请求参数格式

## 🔍 调试技巧

### 1. 查看服务器日志

开发服务器会输出详细日志：

```
📥 收到请求: {
  "prompt": "一只猫",
  "model": "z-image-turbo",
  ...
}

Gitee AI 请求: {
  prompt: '一只猫...',
  model: 'z-image-turbo',
  remaining: 99,
  totalKeys: 5,
  currentKeyIndex: 1,
  keyPreview: 'W593PWIER8...'
}
```

### 2. 查看浏览器控制台

前端会输出请求详情：

```
📤 完整请求数据: {
  "prompt": "一只猫",
  "model": "z-image-turbo",
  ...
}
```

### 3. 检查网络请求

在浏览器开发者工具的 Network 标签中：
1. 找到 `/api/gitee-ai` 请求
2. 查看 Request Payload
3. 查看 Response

## 💡 最佳实践

### 1. 使用多个 API Key

```env
# 5 个 Key = 每天 500 张
GITEE_AI_API_KEYS=key1,key2,key3,key4,key5
```

### 2. 定期更换 Key

- 每月检查 Key 的有效性
- 及时更换失效的 Key
- 保留备用 Key

### 3. 监控使用量

- 定期查看配额使用情况
- 设置使用限制
- 记录使用日志

### 4. 安全管理

- ✅ 不要将 `.env.local` 提交到 Git
- ✅ 不要在前端代码中暴露 API Key
- ✅ 定期更换 API Key
- ✅ 为不同环境使用不同的 Key

## 📊 配额管理

### 查询当前配额

```bash
curl http://localhost:3000/api/gitee-ai
```

响应：
```json
{
  "quota": {
    "used": 45,
    "remaining": 55,
    "limit": 100,
    "date": "Thu Jan 15 2026",
    "resetTime": "明天 00:00"
  }
}
```

### 配额计算

| Key 数量 | 每天总配额 | 适用场景 |
|---------|-----------|---------|
| 1 个    | 100 张    | 个人测试 |
| 3 个    | 300 张    | 小团队 |
| 5 个    | 500 张    | 中型项目 |
| 10 个   | 1000 张   | 生产环境 |

## 🎯 获取更多 API Key

### 方法 1: 多个 Gitee 账号

1. 使用不同邮箱注册多个 Gitee 账号
2. 每个账号获取一个 API Key
3. 将所有 Key 配置到 `GITEE_AI_API_KEYS`

### 方法 2: 联系 Gitee AI

- 访问 Gitee AI 官网
- 申请商业版或企业版
- 获取更高配额的 API Key

### 方法 3: 使用其他服务

如果 Gitee AI 配额不够，可以考虑：
- Gemini API（Google）
- DALL-E API（OpenAI）
- Stable Diffusion API
- Midjourney API

## 📚 相关文档

- [Gitee AI 官方文档](https://ai.gitee.com/docs)
- [多 Key 轮询配置](./GITEE_AI_MULTIPLE_KEYS.md)
- [API 完整文档](./GITEE_AI.md)
- [快速开始指南](./GITEE_AI_QUICK_START.md)

## 🆘 需要帮助？

如果遇到问题：

1. 检查本文档的"常见错误"部分
2. 查看服务器和浏览器日志
3. 使用 curl 直接测试 API Key
4. 确认环境变量配置正确
5. 重启开发服务器

---

**更新时间**：2026-01-15  
**版本**：1.0.1
