"use client"

import { useState, useEffect } from "react"
import { AuthService, type AuthState } from "@/lib/auth"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const state = AuthService.getAuthState()
    setAuthState(state)
    setLoading(false)
  }, [])

  const login = async (spNo: string, password: string) => {
    const result = await AuthService.login(spNo, password)
    if (result.success && result.user) {
      setAuthState({
        user: result.user,
        isAuthenticated: true,
      })
    }
    return result
  }

  const logout = () => {
    AuthService.logout()
    setAuthState({
      user: null,
      isAuthenticated: false,
    })
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading,
    login,
    logout,
  }
}
