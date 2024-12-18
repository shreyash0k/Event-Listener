'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createSubscriptionCheckout } from '@/lib/checkout'
import { SUBSCRIPTION_PLANS } from '@/subscriptions.config'

const tiers = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
  name: plan.name,
  price: plan.name === 'Free' ? '$0' : `$${plan.price}/month`,
  features: [
    `${plan.limits.trackers} trackers`,
    `${plan.limits.checksPerMonth} checks per month`,
  ],
  cta: plan.cta || 'Get Started',
  url: plan.url
}))

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgradeClick = async () => {
    setIsLoading(true)
    await createSubscriptionCheckout()
    setIsLoading(false)
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Choose a plan</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold mb-4">{tier.price}</p>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={tier.url ? () => window.location.href = tier.url : handleUpgradeClick}
                  disabled={isLoading && !tier.url}
                >
                  {isLoading && !tier.url ? 'Loading...' : tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

