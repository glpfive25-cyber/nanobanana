# Z-Image 匿名验证解决方案

> **⚠️ 服务状态更新（2026-01-05）**
>
> Z-Image 免费模型接口已失效，服务暂时不可用。
>
> 建议使用 Gemini 模型作为替代方案。所有代码已保留，以便将来恢复服务。

---

## 问题描述

Z-Image API 现在要求匿名用户验证，调用 API 时需要携带 `z_image_anon_verified` cookie，否则会返回 403 错误：

```json
{
  "success": false,
  "error": "Anonymous verification required",
  "code": "VERIFICATION_REQUIRED"
}
```

## 解决方案

### 架构设计

采用 **Cookie 透传方案**：

```
浏览器 → 前端读取 cookie → 后端接收 → Z-Image API
```

### 实现细节

#### 1. 前端（app/nano/page.tsx）

读取浏览器中的验证 cookie 并传递给后端：

```typescript
// 读取并传递 Z-Image 验证 cookie
const cookies = document.cookie.split(';')
const verificationCookie = cookies.find(c => c.trim().startsWith('z_image_anon_verified='))
if (verificationCookie) {
  const cookieValue = verificationCookie.split('=')[1]
  requestData.verificationCookie = cookieValue
}
```

#### 2. 后端（app/api/zimage/route.ts）

接收 cookie 并在请求头中传递：

```typescript
const headers: any = {
  'Content-Type': 'application/json',
}

if (verificationCookie) {
  headers['Cookie'] = `z_image_anon_verified=${verificationCookie}`
}

response = await fetchWithAgent(apiUrl, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(requestBody),
})
```

#### 3. 错误处理

当检测到 403 验证错误时，自动引导用户：

```typescript
if (response.status === 403 && model === 'zimage') {
  showError('需要验证', 'Z-Image 需要验证：请先访问 https://zimage.run 完成人机验证')
  window.open('https://zimage.run', '_blank')
}
```

## 使用流程

### 首次使用

1. 用户首次使用 Z-Image 功能时，可能没有验证 cookie
2. 系统检测到 403 错误后，会自动打开 zimage.run 网站
3. 用户在 zimage.run 完成人机验证（如果有的话）
4. 验证完成后，浏览器会保存 `z_image_anon_verified` cookie
5. 用户刷新页面，重新尝试生成图片

### 后续使用

- Cookie 会自动保存在浏览器中
- 每次请求都会自动读取并传递
- 无需用户手动操作

## Cookie 格式

```
z_image_anon_verified=时间戳|token|签名
```

示例：
```
z_image_anon_verified=1767599390678|sIyvU8L08UlrMPCiquXdGqInwh5jGQoj|241fd3a709079f5c2d8c683a614aeb2e8cb33dc8b27a35535c077f0c2db60f77
```

## 注意事项

1. **Cookie 有效期**：Cookie 可能会过期，过期后需要重新访问 zimage.run 进行验证
2. **跨域问题**：Cookie 只在同域名下有效，本方案通过后端转发解决
3. **安全性**：Cookie 仅用于匿名验证，不包含敏感信息
4. **浏览器兼容性**：需要浏览器支持 `document.cookie` API

## 故障排查

### 问题：仍然返回 403 错误

**可能原因**：
- Cookie 已过期
- Cookie 格式不正确
- 浏览器禁用了 Cookie

**解决方法**：
1. 清除浏览器 Cookie
2. 重新访问 https://zimage.run 进行验证
3. 检查浏览器是否允许第三方 Cookie

### 问题：控制台显示 "未找到 cookie"

**解决方法**：
1. 在新标签页打开 https://zimage.run
2. 完成页面加载（可能需要完成人机验证）
3. 返回应用页面刷新
4. 重试生成操作

## 更新日志

- **2026-01-05**：实现 Cookie 透传方案，解决匿名验证问题
- **2026-01-05**：添加自动引导和友好错误提示

## 参考资料

- [Z-Image 官网](https://zimage.run/)
- [GitHub - Z-Image](https://github.com/Tongyi-MAI/Z-Image)
