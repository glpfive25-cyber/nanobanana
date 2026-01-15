import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlan, isValidPlanId } from '../server-config'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // 运行时检查 Stripe 配置
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Stripe 未配置',
        message: '请在 .env.local 中配置 STRIPE_SECRET_KEY'
      }, { status: 503 })
    }

    const { planId, customerEmail, customerName } = await request.json()
    
    // 验证必要参数
    if (!planId || !isValidPlanId(planId)) {
      return NextResponse.json({ 
        error: '无效的套餐ID' 
      }, { status: 400 })
    }

    if (!customerEmail) {
      return NextResponse.json({ 
        error: '请提供邮箱地址' 
      }, { status: 400 })
    }

    // 获取套餐信息
    const plan = getPlan(planId)
    
    // 创建或获取Stripe客户
    let customer
    try {
      // 先尝试查找现有客户
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      })
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // 创建新客户
        customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName || undefined,
          metadata: {
            source: 'nano-banana-app'
          }
        })
      }
    } catch (error) {
      console.error('创建/获取客户失败:', error)
      return NextResponse.json({ 
        error: '客户信息处理失败' 
      }, { status: 500 })
    }

    // 创建支付意图
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: plan.currency,
      customer: customer.id,
      metadata: {
        planId: planId,
        planName: plan.name,
        credits: plan.credits.toString(),
        customerEmail: customerEmail
      },
      description: `Nano Banana ${plan.name} - ${plan.credits}个AI积分`,
      receipt_email: customerEmail,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // 避免重定向，保持在应用内
      }
    })

    // 记录支付意图到日志
    console.log(`创建支付意图: ${paymentIntent.id}, 客户: ${customerEmail}, 套餐: ${planId}`)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: plan.price,
      currency: plan.currency,
      planInfo: {
        name: plan.name,
        credits: plan.credits,
        features: plan.features
      }
    })

  } catch (error) {
    console.error('创建支付意图失败:', error)
    
    // 处理Stripe特定错误
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as any
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json({ 
          error: '银行卡信息有误，请检查后重试' 
        }, { status: 400 })
      } else if (stripeError.type === 'StripeRateLimitError') {
        return NextResponse.json({ 
          error: '请求过于频繁，请稍后重试' 
        }, { status: 429 })
      }
    }
    
    return NextResponse.json({ 
      error: '创建支付失败，请稍后重试',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 