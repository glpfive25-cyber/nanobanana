import Stripe from 'stripe'
import { PRICING_PLANS, getPlan, isValidPlanId } from '../../lib/pricing-plans'
export type { PlanId } from '../../lib/pricing-plans'

// 服务器端Stripe配置
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

// 只在实际使用时检查，构建时不报错
export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null as any

export const isTestMode = stripeSecretKey?.startsWith('sk_test_') || false

if (stripeSecretKey) {
  console.log(`🔧 Stripe模式: ${isTestMode ? '测试环境' : '生产环境'}`)
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY 未配置，Stripe 功能将不可用')
}

// 导出定价计划相关功能
export { PRICING_PLANS, getPlan, isValidPlanId }

// Stripe产品ID映射 (需要在Stripe Dashboard中创建对应产品)
export const STRIPE_PRICE_IDS = {
  unlimited: 'price_unlimited_yearly', // 年付无限版
  pro: 'price_pro_monthly',           // 月付专业版
  starter: 'price_starter_onetime'    // 一次性体验版
} 