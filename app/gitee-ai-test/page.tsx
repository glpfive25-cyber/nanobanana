'use client'

import { useState } from 'react'
import GiteeAIQuota from '../components/GiteeAIQuota'

export default function GiteeAITestPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入图片描述')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/gitee-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: 'z-image-turbo'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(`配额已用完：${data.message}`)
        } else {
          setError(data.error || '生成失败')
        }
        return
      }

      setResult(data)
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          Gitee AI 图片生成测试
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#888',
          marginBottom: '2rem'
        }}>
          每天限量 100 张图片
        </p>

        {/* 配额显示 */}
        <div style={{ marginBottom: '2rem' }}>
          <GiteeAIQuota />
        </div>

        {/* 输入区域 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '1rem',
          marginBottom: '1.5rem'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#f59e0b',
            fontWeight: 'bold'
          }}>
            图片描述
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想生成的图片..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '1rem',
              background: loading
                ? 'rgba(245, 158, 11, 0.5)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '生成中...' : '生成图片'}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#ef4444',
            marginBottom: '1.5rem'
          }}>
            ❌ {error}
          </div>
        )}

        {/* 结果显示 */}
        {result && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '1rem'
          }}>
            <h3 style={{
              color: '#10b981',
              marginBottom: '1rem'
            }}>
              ✅ 生成成功
            </h3>

            {result.quota && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ color: '#f59e0b' }}>
                  配额信息：已用 {result.quota.used}/{result.quota.limit}，剩余 {result.quota.remaining} 张
                </div>
              </div>
            )}

            <pre style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              fontSize: '0.85rem',
              color: '#888'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* 使用说明 */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '1rem',
          fontSize: '0.9rem',
          color: '#888'
        }}>
          <h4 style={{ color: '#f59e0b', marginBottom: '0.75rem' }}>使用说明</h4>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>每天限量生成 100 张图片</li>
            <li>配额每天 00:00 自动重置</li>
            <li>使用中文或英文描述均可</li>
            <li>建议使用详细的描述以获得更好的效果</li>
            <li>生成失败不消耗配额</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
