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

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For trying it out",
    features: [
      "1 tracker",
      "30 checks per month",
      "Email alerts",
      "Max frequency: daily",
    ],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$6.99/month",
    description: "For power users",
    features: [
      "5 trackers",
      "200 checks per month",
      "Email alerts",
      "Max frequency: hourly",
    ],
    cta: "Upgrade to Pro",
  },
]

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgradeClick = async () => {
    setIsLoading(true)
    await createSubscriptionCheckout()
    setIsLoading(false)
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
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
                  onClick={tier.name === 'Pro' ? handleUpgradeClick : undefined}
                  disabled={isLoading && tier.name === 'Pro'}
                >
                  {isLoading && tier.name === 'Pro' ? 'Loading...' : tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

