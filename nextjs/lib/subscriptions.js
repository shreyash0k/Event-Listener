import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS, getPlanByPriceId } from '@/subscriptions.config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getUserPlanLimits(stripe_customer_id) {
  try {
    // Default to FREE plan limits
    let planLimits = SUBSCRIPTION_PLANS.FREE.limits;

    if (stripe_customer_id) {
      // Get active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: stripe_customer_id,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const priceId = subscriptions.data[0].items.data[0].price.id;
        const plan = getPlanByPriceId(priceId);
        if (plan) {
          planLimits = plan.limits;
        }
      }
    }

    return planLimits;
  } catch (error) {
    console.error('Error getting user plan:', error);
    return SUBSCRIPTION_PLANS.FREE.limits; // Fallback to free tier
  }
} 