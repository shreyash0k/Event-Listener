export async function createSubscriptionCheckout() {
  try {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        mode: 'subscription',
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}`,
      }),
    })

    const { url, error } = await response.json()
    
    if (error) throw new Error(error)
    if (url) window.location.href = url

    return { error: null }
  } catch (error) {
    console.error('Error creating checkout:', error)
    return { error: error.message }
  }
} 