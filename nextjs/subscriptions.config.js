export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      trackers: 1,
      checksPerMonth: 30
    },
    stripe: {
      priceId: null
    },
    url: '/dashboard',
    cta: 'Try for Free'
  },
  PRO: {
    name: 'Pro',
    price: 6.99,
    limits: {
      trackers: 3,
      checksPerMonth: 2000
    },
    stripe: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
    },
    url: null,
    cta: 'Upgrade'
  },
}

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId) {
  return Object.values(SUBSCRIPTION_PLANS).find(
    plan => plan.stripe.priceId === priceId
  );
}

// Helper function to get plan limits
export function getPlanLimits(planName) {
  return SUBSCRIPTION_PLANS[planName.toUpperCase()]?.limits;
} 