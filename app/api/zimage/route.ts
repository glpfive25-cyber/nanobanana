import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5分钟超时，z-image 可能需要更长时间

// 创建一个忽略 SSL 证书的 https agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// 自定义 fetch 函数，支持自定义 agent
async function fetchWithAgent(url: string, options: any = {}): Promise<Response> {
  // 对于 HTTPS URL，使用自定义 agent
  if (url.startsWith('https://')) {
    // 使用 node-fetch 或原生 https 模块
    const https = await import('https')
    const urlModule = await import('url')
    
    return new Promise((resolve, reject) => {
      const parsedUrl = new urlModule.URL(url)
      const requestOptions: any = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        rejectUnauthorized: false, // 忽略 SSL 证书验证
      }

      const req = https.request(requestOptions, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          // 构造类似 fetch Response 的对象
          const response = {
            ok: res.statusCode! >= 200 && res.statusCode! < 300,
            status: res.statusCode!,
            statusText: res.statusMessage || '',
            headers: new Headers(res.headers as any),
            json: async () => JSON.parse(data),
            text: async () => data,
          } as Response
          resolve(response)
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      if (options.body) {
        req.write(options.body)
      }
      req.end()
    })
  } else {
    // 对于 HTTP URL，使用标准 fetch
    return fetch(url, options)
  }
}

async function zimageHandler(request: NextRequest) {
  try {
    const { prompt, imageData, imageDataArray, size = '1k', guidance_scale = 7, seed = -1, steps = 8, negative_prompt = '', batch_size = 1 } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: '请提供描述' }, { status: 400 })
    }

    // z-image API 端点 - 使用环境变量配置
    const apiUrl = process.env.ZIMAGE_API_URL
      ? `${process.env.ZIMAGE_API_URL}/api/z-image/generate`
      : 'https://zimage.run/api/z-image/generate'

    console.log('Z-Image API 请求:', {
      prompt,
      hasImage: !!(imageDataArray && imageDataArray.length > 0) || !!imageData,
      size,
      steps,
      guidance_scale,
      batch_size
    })

    // 构建请求体 - 使用 zimage.run 的格式
    // 注意：zimage.run 对匿名用户只支持 512x512, 512x768, 768x512
    let width: number, height: number

    if (size === '1k' || size === '2k') {
      // 对于大尺寸，使用支持的最大方形尺寸
      width = 512
      height = 512
    } else if (size === 'portrait') {
      // 竖版
      width = 512
      height = 768
    } else if (size === 'landscape') {
      // 横版
      width = 768
      height = 512
    } else {
      // 默认方形
      width = 512
      height = 512
    }

    const requestBody: any = {
      prompt: prompt,
      width: width,
      height: height,
      modelType: 'turbo', // Z-Image API 要求的模型类型
      batchSize: batch_size || 1 // 支持批量生成
    }

    // 如果有图片，添加到请求中（注意：z-image 主要支持文生图，图生图功能有限）
    if (imageDataArray && Array.isArray(imageDataArray) && imageDataArray.length > 0) {
      // z-image 的图生图支持可能有限，这里我们只传递第一张图作为参考
      console.log('检测到输入图片，但 z-image 主要支持文生图')
      // 可以在这里添加 img2img 的支持，如果 z-image 支持
    } else if (imageData) {
      console.log('检测到单张输入图片，但 z-image 主要支持文生图')
    }

    console.log('发送 Z-Image 请求:', JSON.stringify(requestBody, null, 2))

    // 添加重试机制
    let response: Response | null = null
    let lastError: any = null
    const maxRetries = 3 // z-image 可能需要更多重试

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Z-Image API 尝试 ${attempt}/${maxRetries}`)

        // 使用自定义 fetch 函数来处理 SSL 问题
        response = await fetchWithAgent(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (response.ok || response.status === 502) {
          // 对于 502 错误，我们也继续尝试轮询
          if (response.status === 502) {
            console.log('收到 502 错误，但尝试解析响应...')
          }
          break // 成功或收到可处理的错误，跳出重试循环
        }

        lastError = { status: response.status, statusText: response.statusText }
        console.log(`Z-Image API 尝试 ${attempt} 失败:`, lastError)

        // 如果不是最后一次尝试，等待一段时间再重试
        if (attempt < maxRetries) {
          const waitTime = attempt * 5000 // 递增等待时间：5s, 10s, 15s
          console.log(`等待 ${waitTime/1000} 秒后重试...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      } catch (error) {
        lastError = error
        console.log(`Z-Image API 尝试 ${attempt} 异常:`, error)

        // 如果不是最后一次尝试，等待一段时间再重试
        if (attempt < maxRetries) {
          const waitTime = attempt * 5000
          console.log(`等待 ${waitTime/1000} 秒后重试...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    // 检查最终响应
    if (!response || (!response.ok && response.status !== 502)) {
      let errorData: any = {}
      try {
        if (response) {
          errorData = await response.json()
        }
      } catch (e) {
        errorData = { error: { message: lastError?.message || '网络请求失败' } }
      }

      console.error('Z-Image API错误:', errorData)

      return NextResponse.json({
        error: errorData.error?.message || '生成失败',
        details: errorData,
        suggestion: '建议：1) 稍后重试 2) 使用更简短的提示词 3) 尝试减少生成数量'
      }, { status: response?.status || 500 })
    }

    // 对于 502 错误，尝试解析响应
    let data: any
    if (response && response.status === 502) {
      console.log('尝试解析 502 错误响应...')
      try {
        const text = await response.text()
        console.log('502 响应内容:', text)
        // 尝试从 502 响应中提取任务 ID（可能服务器在错误中返回了 ID）
        const taskIdMatch = text.match(/task[_\s]?ID[:\s]+([A-Za-z0-9]+)/i)
        if (taskIdMatch && taskIdMatch[1]) {
          data = { task_id: taskIdMatch[1] }
          console.log('从 502 错误中提取到任务 ID:', taskIdMatch[1])
        } else {
          return NextResponse.json({
            error: '服务器返回 502 Bad Gateway 错误',
            suggestion: '服务器可能正在重启或过载，请稍后重试'
          }, { status: 502 })
        }
      } catch (e) {
        return NextResponse.json({
          error: '服务器返回 502 Bad Gateway 错误',
          suggestion: '服务器可能正在重启或过载，请稍后重试'
        }, { status: 502 })
      }
    } else {
      data = await response.json()
    }

    console.log('Z-Image API响应:', data)

    // 解析 zimage.run 响应格式
    // 响应格式: { success: true, data: { uuid: "xxx", task: {...} } }
    if (data.success && data.data && data.data.uuid) {
      const taskUuid = data.data.uuid
      const baseUrl = process.env.ZIMAGE_API_URL || 'https://zimage.run'
      
      // 返回任务 UUID，前端需要轮询获取结果
      return NextResponse.json({
        taskUuid: taskUuid,
        pollUrl: `${baseUrl}/api/z-image/task/${taskUuid}`,
        model: 'zimage',
        task: data.data.task
      })
    }

    return NextResponse.json({
      error: '未能从响应中提取任务UUID',
      raw_response: data
    }, { status: 500 })

  } catch (error) {
    console.error('Z-Image生成错误:', error)
    return NextResponse.json({
      error: '生成失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return zimageHandler(request)
}