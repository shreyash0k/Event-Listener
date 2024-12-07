export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    limits: {
      trackers: 1,
      checksPerMonth: 30
    },
    stripe: {
      priceId: null
    }
  },
  PRO: {
    name: 'Pro',
    limits: {
      trackers: 5,
      checksPerMonth: 2000
    },
    stripe: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
    }
  },
  ULTRA: {
    name: 'Ultra',
    limits: {
      trackers: 10,
      checksPerMonth: 5000
    },
    stripe: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_ULTRA_PRICE_ID
    }
  }
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