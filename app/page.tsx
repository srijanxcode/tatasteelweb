"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { TataSteelLogo } from "@/components/tata-steel-logo"
import { Loader2, Shield, Users, BarChart3 } from "lucide-react"

export default function LoginPage() {
  const [spNo, setSpNo] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(spNo, password)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.02)_25%,rgba(59,130,246,0.02)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.02)_75%)] bg-[length:60px_60px]"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <TataSteelLogo size="xl" variant="full" className="justify-center mb-8" />
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Canteen Management System</h1>
              <p className="text-xl text-blue-700 font-semibold">MTS Project - Vendor Attendance</p>
              <div className="text-sm text-slate-600 space-y-1 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                <p className="font-semibold text-blue-800">Developed by srijan sharma</p>
                <p className="text-slate-500">Advanced Vendor Attendance Monitoring System</p>
              </div>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md ring-1 ring-blue-100/50">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Vendor Login
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Enter your credentials to access the canteen management system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="spNo" className="text-slate-700 font-semibold text-sm">
                    SP Number
                  </Label>
                  <Input
                    id="spNo"
                    type="text"
                    placeholder="Enter your SP Number (e.g., 806760)"
                    value={spNo}
                    onChange={(e) => setSpNo(e.target.value)}
                    required
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Access Tata Steel System
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-600 space-y-3">
                  <p className="font-semibold text-center text-blue-800 flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    Demo Credentials
                  </p>
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/80 p-2 rounded-lg">
                        <p className="font-semibold text-blue-700">SP No: 806760</p>
                        <p className="text-slate-500">Vendor User 1</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <p className="font-semibold text-blue-700">SP No: 806759</p>
                        <p className="text-slate-500">Vendor User 2</p>
                      </div>
                    </div>
                    <div className="text-center bg-white/80 p-2 rounded-lg">
                      <p className="font-semibold text-slate-700">Password: tata123</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-slate-600 bg-white/80 backdrop-blur-md rounded-xl p-6 border border-blue-100 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-800 font-bold text-base">
                <BarChart3 className="h-5 w-5" />
                Project Supervision
              </div>
              <div className="grid grid-cols-1 gap-2 text-slate-600">
                <div className="bg-blue-50/50 p-2 rounded-lg">
                  <span className="font-semibold text-blue-700">Senior Manager:</span> Senior Management Team
                </div>
                <div className="bg-blue-50/50 p-2 rounded-lg">
                  <span className="font-semibold text-blue-700">Department Head:</span> ITS Leadership
                </div>
                <div className="bg-blue-50/50 p-2 rounded-lg">
                  <span className="font-semibold text-blue-700">Chief of ITS:</span> Technology Division
                </div>
              </div>
              <div className="pt-3 border-t border-slate-300">
                <p className="text-xs text-slate-500 font-medium">© 2024 Tata Steel Limited. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
