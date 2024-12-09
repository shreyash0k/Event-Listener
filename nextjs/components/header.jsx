import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dog } from "lucide-react"

export function Header() {
  return (
    <header className="flex justify-between items-center p-6">
      <div className="text-xl font-bold flex items-center gap-2">
        <Dog className="w-6 h-6" />
        Scout Pup
      </div>
      <div className="flex items-center gap-6">
     
        <Link href="/login" className="cursor-pointer">
          Login
        </Link>
        <Link href="/login" className="cursor-pointer">
          <Button>
            Sign Up
          </Button>
        </Link>
      </div>
    </header>
  )
}

