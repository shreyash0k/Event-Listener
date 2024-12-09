import Pricing from "@/components/pricing"
import { Dog } from "lucide-react"


export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="text-xl font-bold flex items-center justify-left gap-2 p-6">
        <Dog className="w-6 h-6" />
        Scout Pup
      </div>
     
        
      <Pricing />
    </main>
  )
} 