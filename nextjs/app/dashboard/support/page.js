import { Dog } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="min-h-screen flex items-start justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <p>
          Hey there, thanks for using Scout Pup!
        </p>
        
        <p>
          We apologize if you&apos;re facing any issues. Our product is in beta and 
          we&apos;re improving everyday. If you need assistance or have feedback, the fastest way to reach us is at{" "}
          <Link 
            href="mailto:XXX@gmail.com" 
            className="text-primary hover:underline"
          >
            XXX@gmail.com
          </Link>
          {" "}or{" "}
          <Link 
            href="tel:123-456-6123"
            className="text-primary hover:underline"
          >
            123-456-6123
          </Link>.
        </p>

        <div className="pt-4">
          <p>Cheers,</p>
          <div className="flex items-center font-bold gap-2 mt-1">
            <p>Scout Pup Team</p>
            <Dog className="h-5 w-5 text-primary text-black" />
          </div>
        </div>
      </div>
    </div>
  )
}
