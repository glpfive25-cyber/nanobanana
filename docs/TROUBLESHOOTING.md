# 故障排查指南

## 🔍 Gitee AI / Z-Image 问题

### 问题：zimage 用不了 / 返回 400 错误

**症状：**
```
/api/gitee-ai:1 Failed to load resource: the server responded with a status of 400
```

**原因：**
1. ❌ 默认的 API Key 已达到配额上限
2. ❌ 未配置自己的 API Key
3. ❌ API Key 格式错误

**解决方案：**

#### 步骤 1: 获取新的 API Key

访问 [Gitee AI](https://ai.gitee.com) 获取你自己的 API Key

#### 步骤 2: 配置环境变量

编辑 `.env.local` 文件：

```env
# 单个 Key
GITEE_AI_API_KEYS=你的新API_Key

# 或多个 Key（推荐）
GITEE_AI_API_KEYS=key1,key2,key3,key4,key5
```

#### 步骤 3: 重启服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

#### 步骤 4: 测试

```bash
# 测试 API Key 是否有效
curl https://ai.gitee.com/v1/images/generations \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的API_Key" \
  -d '{
    "prompt": "一只猫",
    "model": "z-image-turbo",
    "num_inference_steps": 9,
    "guidance_scale": 1,
    "image_scale": 1
  }'
```

**成功响应：**
```json
{
  "data": [{"url": "...", "b64_json": "..."}]
}
```

**失败响应：**
```json
{
  "error": {
    "code": "400",
    "message": "您的"免费体验访问令牌"已达到最大使用额"
  }
}
```

### 问题：API Key 配额已用完

**错误信息：**
```json
{
  "error": "API Key 配额已用完",
  "code": "API_QUOTA_EXCEEDED"
}
```

**解决方案：**

1. **配置多个 API Key**（推荐）
   ```env
   GITEE_AI_API_KEYS=key1,key2,key3,key4,key5
   ```
   5个Key = 每天500张图片

2. **等待配额重置**
   - 配额通常每天重置
   - 查看错误信息中的重置时间

3. **获取新的 API Key**
   - 使用不同的 Gitee 账号
   - 申请商业版 API

### 问题：未配置 API Key

**错误信息：**
```json
{
  "error": "未配置 API Key",
  "code": "NO_API_KEY"
}
```

**解决方案：**

1. 检查 `.env.local` 文件是否存在
2. 确认已添加 `GITEE_AI_API_KEYS=your_key`
3. 确保没有拼写错误
4. 重启开发服务器

## 🌐 广告相关问题

### 问题：广告被拦截

**症状：**
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
Adsterra Direct Link: 广告未启用
```

**原因：**
- 浏览器安装了广告拦截插件（AdBlock, uBlock Origin 等）
- 浏览器内置广告拦截功能

**解决方案：**

这是**正常现象**，不影响应用功能。如果需要测试广告：

1. 禁用广告拦截插件
2. 使用隐私模式/无痕模式
3. 使用不同的浏览器

### 问题：Smartlinks 加载失败

**症状：**
```
Smartlinks 加载失败: Event
请检查 Smartlinks URL 和 ID 配置是否正确
```

**原因：**
1. 广告被拦截
2. Smartlinks 配置错误
3. 网络问题

**解决方案：**

1. **检查配置**（`.env.local`）：
   ```env
   NEXT_PUBLIC_SMARTLINKS_ENABLED=true
   NEXT_PUBLIC_SMARTLINKS_URL=your_smartlink_url
   NEXT_PUBLIC_SMARTLINKS_ID=your_smartlink_id
   ```

2. **禁用 Smartlinks**（如果不需要）：
   ```env
   NEXT_PUBLIC_SMARTLINKS_ENABLED=false
   ```

3. **检查广告拦截器**

## 🔧 其他常见问题

### 问题：请提供图片描述

**错误信息：**
```json
{
  "error": "请提供图片描述",
  "received": ["model", "timestamp"]
}
```

**原因：**
- 前端没有传递 `prompt` 参数
- 请求体格式错误

**解决方案：**

1. 确保输入了描述文字
2. 检查浏览器控制台的请求日志
3. 查看服务器日志

### 问题：服务器返回 500 错误

**可能原因：**
1. API Key 配置错误
2. 网络连接问题
3. 服务器内部错误

**解决方案：**

1. **查看服务器日志**
   ```bash
   # 开发服务器会输出详细错误信息
   npm run dev
   ```

2. **检查环境变量**
   ```bash
   # 确认环境变量已加载
   node -e "console.log(process.env.GITEE_AI_API_KEYS)"
   ```

3. **测试 API 连接**
   ```bash
   curl https://ai.gitee.com/v1/images/generations \
     -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_KEY" \
     -d '{"prompt":"test","model":"z-image-turbo"}'
   ```

### 问题：图片生成很慢

**原因：**
- AI 模型处理需要时间
- 网络延迟
- 服务器负载高

**解决方案：**

1. **耐心等待**
   - Gitee AI 通常需要 5-30 秒
   - 复杂图片可能需要更长时间

2. **减少生成数量**
   - 一次生成 1 张而不是 4 张

3. **简化提示词**
   - 使用更简短的描述

4. **检查网络**
   - 确保网络连接稳定

## 🧪 调试工具

### 1. 查看服务器日志

开发服务器会输出详细日志：

```bash
npm run dev
```

日志示例：
```
📥 收到请求: {
  "prompt": "一只猫",
  "model": "z-image-turbo"
}

Gitee AI 请求: {
  prompt: '一只猫...',
  totalKeys: 5,
  currentKeyIndex: 1,
  keyPreview: 'W593PWIER8...'
}
```

### 2. 浏览器控制台

打开浏览器开发者工具（F12），查看：
- Console 标签：前端日志
- Network 标签：网络请求详情

### 3. 测试脚本

```bash
# 测试 Gitee AI API
node test-gitee-ai.js

# 或使用 curl
bash test-api-direct.sh
```

### 4. 测试页面

访问测试页面：
```
http://localhost:3000/gitee-ai-test
```

## 📚 相关文档

- [Gitee AI 配置指南](./GITEE_AI_SETUP.md)
- [多 Key 轮询配置](./GITEE_AI_MULTIPLE_KEYS.md)
- [API 完整文档](./GITEE_AI.md)
- [快速开始指南](./GITEE_AI_QUICK_START.md)

## 🆘 仍然需要帮助？

如果以上方法都无法解决问题：

1. **检查所有配置**
   - 环境变量格式
   - API Key 有效性
   - 网络连接

2. **查看完整日志**
   - 服务器日志
   - 浏览器控制台
   - 网络请求详情

3. **使用测试工具**
   - curl 直接测试 API
   - 测试脚本
   - 测试页面

4. **提交 Issue**
   - 提供错误信息
   - 提供日志截图
   - 说明复现步骤

---

**更新时间**：2026-01-15  
**版本**：1.0.0
