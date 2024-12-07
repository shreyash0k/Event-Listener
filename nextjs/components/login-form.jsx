import Link from "next/link"
import { createClient } from '@/lib/supabase'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Dog } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define the server action outside the component
async function signInWithGoogle() {
  'use server'
  
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin')
  
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    console.log(error)
    return
  }

  return redirect(data.url)
}

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="space-y-0">
        <CardTitle className="text-2xl text-left flex items-center justify-left gap-2">
          <Dog className="w-6 h-6" />
          Scout Pup
        </CardTitle>
        <p className="text-left text-lg text-muted-foreground">
          Track anything on any website.
        </p>
      </CardHeader>
      <CardContent className="space-y-12 mt-4">
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground px-6">
          By continuing, you acknowledge that you understand and agree to the{" "}
          <Link 
            href="/tos" 
            className="underline hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link 
            href="/privacy-policy" 
            className="underline hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
