# Gitee AI 多 Key 轮询配置指南

## 📋 概述

为了突破单个 API Key 每天 100 张的限制，系统支持配置多个 Gitee AI API Key，并自动轮询使用。

## 🎯 优势

- **突破配额限制**：5 个 Key = 每天 500 张图片
- **自动轮询**：系统自动切换 Key，无需手动管理
- **负载均衡**：平均分配请求到各个 Key
- **简单配置**：只需在环境变量中用逗号分隔

## ⚙️ 配置方法

### 1. 获取多个 API Key

访问 [Gitee AI](https://ai.gitee.com) 获取多个 API Key：

- 可以使用多个账号
- 或者联系 Gitee AI 申请多个 Key

### 2. 配置环境变量

在 `.env.local` 文件中配置：

```env
# 多个 Key 用逗号分隔（推荐）
GITEE_AI_API_KEYS=key1,key2,key3,key4,key5

# 或者使用换行（也支持）
GITEE_AI_API_KEYS=key1,
  key2,
  key3,
  key4,
  key5
```

### 3. 单个 Key 配置（兼容旧版）

如果只有一个 Key，也可以使用：

```env
# 方式 1：使用新变量名
GITEE_AI_API_KEYS=your_single_key

# 方式 2：使用旧变量名（兼容）
GITEE_AI_API_KEY=your_single_key
```

## 🔄 轮询机制

系统使用**轮询算法**自动切换 Key：

```
请求 1 → Key 1
请求 2 → Key 2
请求 3 → Key 3
请求 4 → Key 4
请求 5 → Key 5
请求 6 → Key 1  (循环)
...
```

### 算法说明

```typescript
// 基于请求次数轮询
const currentKeyIndex = requestCount % totalKeys
const apiKey = apiKeys[currentKeyIndex]
```

## 📊 配额计算

### 单个 Key
- 每天限额：100 张
- 总配额：100 张/天

### 多个 Key
| Key 数量 | 每天总配额 |
|---------|-----------|
| 1 个    | 100 张    |
| 3 个    | 300 张    |
| 5 个    | 500 张    |
| 10 个   | 1000 张   |

## 🧪 测试配置

### 方法 1：使用测试脚本

```bash
node test-gitee-ai.js
```

输出会显示：
```
Gitee AI 请求: {
  prompt: '一只可爱的小猫...',
  model: 'z-image-turbo',
  remaining: 99,
  totalKeys: 5,        ← 总 Key 数量
  currentKeyIndex: 1   ← 当前使用的 Key
}
```

### 方法 2：查看日志

启动开发服务器后，每次请求都会在控制台显示：

```
Gitee AI 请求: {
  ...
  totalKeys: 5,
  currentKeyIndex: 3
}
```

## 💡 最佳实践

### 1. Key 数量建议

- **个人使用**：1-3 个 Key（100-300 张/天）
- **小团队**：3-5 个 Key（300-500 张/天）
- **生产环境**：5-10 个 Key（500-1000 张/天）

### 2. Key 管理

```env
# 建议使用有意义的注释
GITEE_AI_API_KEYS=\
  key_account1_xxx,\  # 账号1
  key_account2_xxx,\  # 账号2
  key_account3_xxx    # 账号3
```

### 3. 安全建议

- ✅ 不要将 `.env.local` 提交到 Git
- ✅ 定期更换 API Key
- ✅ 监控 Key 的使用情况
- ✅ 为不同环境使用不同的 Key

## 🔍 故障排查

### 问题 1：Key 格式错误

**症状**：所有请求都失败

**解决**：
```env
# ❌ 错误：包含空格或特殊字符
GITEE_AI_API_KEYS=key1, key2 , key3

# ✅ 正确：去除多余空格
GITEE_AI_API_KEYS=key1,key2,key3
```

### 问题 2：某个 Key 失效

**症状**：部分请求失败

**解决**：
1. 检查日志中的 `currentKeyIndex`
2. 找出失效的 Key
3. 从配置中移除该 Key

### 问题 3：配额仍然不够

**解决方案**：
1. 增加更多 Key
2. 调整 `DAILY_LIMIT` 配置
3. 考虑使用付费 API

## 📈 监控和统计

### 查看当前配额

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

### 实时监控

在前端页面中会显示：
- 已用配额
- 剩余配额
- 进度条
- 重置时间

## 🚀 高级配置

### 1. 调整总配额限制

编辑 `app/api/gitee-ai/route.ts`：

```typescript
// 如果有 5 个 Key，可以设置为 500
const DAILY_LIMIT = 500  // 5 keys × 100
```

### 2. 智能 Key 选择

可以实现更智能的 Key 选择策略：

```typescript
// 基于 Key 的剩余配额选择
// 基于响应时间选择
// 基于错误率选择
```

### 3. Key 池管理

```typescript
// 实现 Key 池，动态添加/移除 Key
// 自动检测失效的 Key
// 负载均衡优化
```

## 📝 配置示例

### 开发环境

```env
# .env.local
GITEE_AI_API_KEYS=dev_key_1,dev_key_2
```

### 生产环境

```env
# Vercel 环境变量
GITEE_AI_API_KEYS=prod_key_1,prod_key_2,prod_key_3,prod_key_4,prod_key_5
```

## 🎉 总结

通过配置多个 API Key：
- ✅ 突破单 Key 限制
- ✅ 自动轮询使用
- ✅ 简单易配置
- ✅ 无需修改代码

配置 5 个 Key，每天可生成 500 张图片！🚀

---

**更新时间**：2026-01-15  
**版本**：1.0.0
