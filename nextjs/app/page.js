"use client"

import { Button } from "@/components/ui/button"
import Pricing from "@/components/pricing"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Dog } from "lucide-react"

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["job opportunities", "price drops", "social media", "news articles"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Reduced from 3000 to 2000 milliseconds

    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: { y: 20, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="text-xl font-bold flex items-center gap-2">
          <Dog className="w-6 h-6" />
          Scout Pup
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="cursor-pointer">
            Login
          </Link>
          <Button>Sign up</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-wrap items-center justify-center gap-20 lg:gap-48 px-6 py-24">
        {/* Left side - Text content */}
        <div className="flex flex-col items-start text-left space-y-8 max-w-[600px]">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
            Get notified about
            <span className="relative block h-[70px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: "spring", stiffness: 200, damping: 25 },
                    opacity: { duration: 0.35 },
                  }}
                  className="absolute left-0"
                >
                  {words[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Keep track of anything on any website
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">
              Get Started
            </Link>
          </Button>
        </div>

        {/* Right side - Video placeholder */}
        <div className="w-[500px] h-[400px] bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Video Coming Soon</p>
        </div>
      </section>

      <Pricing />

      {/* Footer with links */}
      <div className="text-sm text-gray-500 pb-8 mt-auto text-center space-x-4">
        <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        <Link href="/tos" className="hover:underline">Terms of Service</Link>
      </div>
    </main>
  )
}