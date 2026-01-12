import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * Gitee AI 图片生成接口
 * 
 * 限制说明：
 * - 每天限量生成 100 张图片
 * - 超过限额后需要等待第二天重置
 * - 建议合理使用配额
 */

// 用于跟踪每日使用量（生产环境建议使用数据库或 Redis）
let dailyUsage = {
  date: new Date().toDateString(),
  count: 0
}

// 重置每日计数
function checkAndResetDailyLimit() {
  const today = new Date().toDateString()
  if (dailyUsage.date !== today) {
    dailyUsage = {
      date: today,
      count: 0
    }
  }
}

async function giteeAiHandler(request: NextRequest) {
  try {
    // 检查并重置每日限额
    checkAndResetDailyLimit()

    // 检查是否超过每日限额
    const DAILY_LIMIT = 100
    if (dailyUsage.count >= DAILY_LIMIT) {
      return NextResponse.json({
        error: '已达到每日生成限额',
        code: 'DAILY_LIMIT_EXCEEDED',
        message: `每天限量生成 ${DAILY_LIMIT} 张图片，今日配额已用完`,
        remaining: 0,
        limit: DAILY_LIMIT,
        resetTime: '明天 00:00',
        suggestion: '请明天再来，或联系管理员增加配额'
      }, { status: 429 })
    }

    const {
      prompt,
      negative_prompt = 'blurry ugly bad',
      model = 'z-image-turbo',
      num_inference_steps = 9,
      guidance_scale = 1,
      control_image,
      control_mode,
      control_context_scale = 0.75,
      image_scale = 1
    } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: '请提供图片描述' }, { status: 400 })
    }

    // Gitee AI API 配置
    const apiUrl = 'https://ai.gitee.com/v1/images/generations'
    const apiKey = process.env.GITEE_AI_API_KEY || 'W593PWIER85HX7EQTVXXCVZ28Y4HAHJR4COYXPJZ'

    console.log('Gitee AI 请求:', {
      prompt: prompt.substring(0, 50) + '...',
      model,
      remaining: DAILY_LIMIT - dailyUsage.count
    })

    // 构建请求体 - 使用 OpenAI 兼容格式
    const requestBody: any = {
      prompt,
      model,
      negative_prompt,
      num_inference_steps,
      guidance_scale,
      image_scale
    }

    // 可选参数：控制图像
    if (control_image) {
      requestBody.control_image = control_image
      requestBody.control_mode = control_mode || 'HED'
      requestBody.control_context_scale = control_context_scale
    }

    // 发送请求到 Gitee AI
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gitee AI API 错误:', errorData)

      return NextResponse.json({
        error: errorData.error?.message || '生成失败',
        details: errorData,
        suggestion: '请检查提示词或稍后重试'
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('Gitee AI 响应成功:', data)

    // 增加使用计数
    dailyUsage.count++

    // 处理响应数据
    // Gitee AI 返回格式: { data: [{ url: "...", b64_json: "..." }] }
    // 转换为我们前端期望的格式
    let imageData = null
    let imageUrl = null
    
    if (data.data && data.data.length > 0) {
      const firstImage = data.data[0]
      
      if (firstImage.b64_json) {
        // 如果返回 base64，直接使用
        imageData = firstImage.b64_json
      } else if (firstImage.url) {
        // 如果返回 URL，下载并转换为 base64
        try {
          const imageResponse = await fetch(firstImage.url, { timeout: 30000 } as any)
          if (imageResponse.ok) {
            const buffer = await imageResponse.arrayBuffer()
            imageData = Buffer.from(buffer).toString('base64')
          } else {
            // 如果下载失败，返回 URL
            imageUrl = firstImage.url
          }
        } catch (downloadError) {
          console.error('下载图片失败:', downloadError)
          // 下载失败时返回 URL
          imageUrl = firstImage.url
        }
      }
    }

    // 返回结果，包含剩余配额信息
    return NextResponse.json({
      imageData: imageData,
      imageUrl: imageUrl,
      mimeType: 'image/png',
      model: 'z-image-turbo',
      originalResponse: data, // 保留原始响应供调试
      quota: {
        used: dailyUsage.count,
        remaining: DAILY_LIMIT - dailyUsage.count,
        limit: DAILY_LIMIT,
        resetTime: '明天 00:00'
      }
    })

  } catch (error) {
    console.error('Gitee AI 生成错误:', error)
    return NextResponse.json({
      error: '生成失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return giteeAiHandler(request)
}

// 获取当前配额状态
export async function GET() {
  checkAndResetDailyLimit()
  
  const DAILY_LIMIT = 100
  return NextResponse.json({
    quota: {
      used: dailyUsage.count,
      remaining: DAILY_LIMIT - dailyUsage.count,
      limit: DAILY_LIMIT,
      date: dailyUsage.date,
      resetTime: '明天 00:00'
    }
  })
}
