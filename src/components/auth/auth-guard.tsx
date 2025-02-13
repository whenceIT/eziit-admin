"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { paths } from "@/paths"
import { authClient } from "@/lib/auth/client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && !authClient.getToken()) {
      router.push(paths.auth.signIn)
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user && !authClient.getToken()) {
    return null
  }

  return <>{children}</>
}

