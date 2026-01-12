# 前端 Z-Image 接口更新说明

## 更新内容

已将前端的 Z-Image 接口更新为 Gitee AI 接口，主要变更如下：

### 1. API 端点变更

**之前：**
```typescript
endpoint = '/api/zimage'
```

**现在：**
```typescript
endpoint = '/api/gitee-ai'
```

### 2. 请求参数变更

**之前（zimage.run）：**
```typescript
{
  size: '1k',
  steps: 8,
  guidance_scale: 7,
  batch_size: 1,
  negative_prompt: '模糊,水印,低质量,变形',
  verificationCookie: '...'  // 需要验证 cookie
}
```

**现在（Gitee AI）：**
```typescript
{
  model: 'z-image-turbo',
  num_inference_steps: 9,
  guidance_scale: 1,
  image_scale: 1,
  negative_prompt: 'blurry ugly bad'
}
```

### 3. 响应处理变更

**之前：** 异步任务，需要轮询
```typescript
if (data.taskUuid) {
  pollZImageResult(data.taskUuid)
}
```

**现在：** 同步返回结果
```typescript
setResult(data)

// 响应包含配额信息
if (data.quota) {
  console.log(`剩余配额: ${data.quota.remaining}`)
}
```

### 4. 错误处理变更

**之前：** 403 验证错误
```typescript
if (response.status === 403) {
  // 需要访问 zimage.run 进行验证
  window.open('https://zimage.run', '_blank')
}
```

**现在：** 429 配额超限
```typescript
if (response.status === 429) {
  // 每日配额已用完
  showError('配额已用完', '每天限量 100 张，请明天再来')
}
```

### 5. UI 显示变更

**模型名称：**
- 之前：`Z-Image (免费模型)` / `Z-Image (暂不可用)`
- 现在：`Gitee AI (限量100张/天)` / `Gitee AI (100/day limit)`

**按钮样式：**
- 颜色：从灰色（禁用）改为橙色（启用）
- 状态：从 `disabled` 改为可点击

## 更新的文件

### 核心文件
1. **app/nano/page.tsx** - 主要的 Nano Banana 页面
2. **app/nano/enhanced-page.tsx** - 增强版页面
3. **app/api/gitee-ai/route.ts** - 新的 API 路由

### 新增文件
1. **app/components/GiteeAIQuota.tsx** - 配额显示组件
2. **app/gitee-ai-test/page.tsx** - 测试页面
3. **docs/GITEE_AI.md** - 完整文档
4. **docs/GITEE_AI_QUICK_START.md** - 快速开始指南
5. **scripts/test-gitee-ai.sh** - Bash 测试脚本
6. **scripts/test-gitee-ai.py** - Python 测试脚本

## 功能特性

### 1. 每日配额限制
- 每天限量 100 张图片
- 自动在 00:00 重置
- 超过限额返回 429 错误

### 2. 配额显示
- 实时显示已用/剩余配额
- 进度条可视化
- 配额不足时警告提示

### 3. 错误处理
- 429：配额超限
- 503：服务不可用
- 400：参数错误
- 500：服务器错误

## 使用方法

### 在主应用中使用

1. 访问 `/nano` 页面
2. 选择 "Gitee AI" 模型
3. 输入图片描述
4. 点击生成

### 测试页面

访问 `/gitee-ai-test` 查看：
- 实时配额显示
- 简单的生成测试
- 完整的响应信息

### API 调用

```typescript
const response = await fetch('/api/gitee-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '你的图片描述',
    model: 'z-image-turbo'
  })
})

const data = await response.json()

if (response.ok) {
  console.log('生成成功')
  console.log('剩余配额:', data.quota.remaining)
} else if (response.status === 429) {
  console.log('配额已用完')
}
```

## 配额管理

### 查询配额

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

### 调整配额

修改 `app/api/gitee-ai/route.ts`：

```typescript
const DAILY_LIMIT = 100  // 改为你需要的数量
```

## 注意事项

1. **配额存储**
   - 当前使用内存存储
   - 服务重启会重置计数
   - 生产环境建议使用数据库或 Redis

2. **API Key**
   - 在 `.env.local` 中配置
   - 默认值已内置在代码中
   - 建议使用环境变量

3. **兼容性**
   - 移除了 cookie 验证逻辑
   - 移除了轮询机制
   - 简化了参数配置

## 测试

### 快速测试

```bash
# 启动开发服务器
npm run dev

# 运行测试脚本
./scripts/test-gitee-ai.sh

# 或使用 Python
python3 scripts/test-gitee-ai.py
```

### 手动测试

1. 访问 http://localhost:3000/gitee-ai-test
2. 输入图片描述
3. 点击生成
4. 查看配额变化

## 迁移指南

如果你有自定义的前端代码使用了旧的 Z-Image 接口：

1. **更新 API 端点**
   ```typescript
   // 旧
   fetch('/api/zimage', ...)
   
   // 新
   fetch('/api/gitee-ai', ...)
   ```

2. **更新请求参数**
   ```typescript
   // 移除
   - size
   - steps
   - batch_size
   - verificationCookie
   
   // 添加
   + model: 'z-image-turbo'
   + num_inference_steps: 9
   + image_scale: 1
   ```

3. **更新响应处理**
   ```typescript
   // 移除轮询逻辑
   - pollZImageResult(data.taskUuid)
   
   // 直接使用结果
   + setResult(data)
   + console.log(data.quota)
   ```

4. **更新错误处理**
   ```typescript
   // 移除 403 验证错误处理
   - if (status === 403) { ... }
   
   // 添加 429 配额错误处理
   + if (status === 429) { ... }
   ```

## 相关文档

- [Gitee AI 完整文档](./GITEE_AI.md)
- [快速开始指南](./GITEE_AI_QUICK_START.md)
- [API 配置说明](../API_CONFIG_README.md)

## 更新日志

- **2026-01-12**：完成前端接口迁移，从 zimage.run 切换到 Gitee AI
