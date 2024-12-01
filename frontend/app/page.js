import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="text-xl font-bold">
          Event Listener
        </div>
        <div className="flex items-center gap-6">
          <span className="cursor-pointer">Login</span>
          <Button>Sign up</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          Event Listener
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Keep track of any change on any website
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard">
            Get Started
          </Link>
        </Button>
      </section>
    </main>
  )
}