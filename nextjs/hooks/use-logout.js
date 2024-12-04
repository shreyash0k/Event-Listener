import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useLogout() {
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [router])

  return logout
} 