'use client'

import { useState, useEffect } from 'react'

interface QuotaInfo {
  used: number
  remaining: number
  limit: number
  date: string
  resetTime: string
}

export default function GiteeAIQuota() {
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuota = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/gitee-ai')
      if (response.ok) {
        const data = await response.json()
        setQuota(data.quota)
      } else {
        setError('获取配额失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuota()
  }, [])

  if (loading && !quota) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: '#f59e0b'
      }}>
        加载配额信息...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: '#ef4444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{error}</span>
        <button
          onClick={fetchQuota}
          style={{
            padding: '0.25rem 0.5rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: 'none',
            borderRadius: '0.25rem',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          重试
        </button>
      </div>
    )
  }

  if (!quota) return null

  const percentage = (quota.remaining / quota.limit) * 100
  const isLow = quota.remaining < 10
  const isMedium = quota.remaining < 50 && quota.remaining >= 10

  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '0.75rem',
      fontSize: '0.9rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div>
          <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            Gitee AI 每日配额
          </div>
          <div style={{ color: '#888', fontSize: '0.8rem' }}>
            {quota.resetTime} 重置
          </div>
        </div>
        <button
          onClick={fetchQuota}
          style={{
            padding: '0.25rem 0.5rem',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.25rem',
            color: '#f59e0b',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          刷新
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.85rem'
      }}>
        <span style={{ color: '#888' }}>已使用</span>
        <span style={{ color: isLow ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
          {quota.used} / {quota.limit}
        </span>
      </div>

      {/* 进度条 */}
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          width: `${100 - percentage}%`,
          height: '100%',
          background: isLow
            ? 'linear-gradient(90deg, #ef4444, #dc2626)'
            : isMedium
            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
            : 'linear-gradient(90deg, #10b981, #059669)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}>
        <span style={{ color: '#888' }}>剩余</span>
        <span style={{
          color: isLow ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981',
          fontWeight: 'bold'
        }}>
          {quota.remaining} 张
        </span>
      </div>

      {isLow && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: '#ef4444',
          fontSize: '0.8rem',
          textAlign: 'center'
        }}>
          ⚠️ 配额即将用完！
        </div>
      )}
    </div>
  )
}
