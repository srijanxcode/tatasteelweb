"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { MockDatabase } from "@/lib/database"
import { TataSteelLogo } from "@/components/tata-steel-logo"
import { Clock, LogOut, Users, FileText, CheckCircle, XCircle, Utensils } from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [todayStats, setTodayStats] = useState({
    punchIns: 0,
    punchOuts: 0,
    currentStatus: "Not Punched In",
    lastMeal: "-",
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
    if (user) {
      const today = new Date().toISOString().split("T")[0]
      const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
      const punchIns = todayRecords.filter((r) => r.status === "punched-in")
      const punchOuts = todayRecords.filter((r) => r.status === "punched-out")

      const currentStatus = punchIns.length > punchOuts.length ? "Punched In" : "Not Punched In"
      const lastMeal = punchIns.length > 0 ? punchIns[punchIns.length - 1].mealType : "-"

      setTodayStats({
        punchIns: punchIns.length,
        punchOuts: punchOuts.length,
        currentStatus,
        lastMeal,
      })
    }
  }, [isAuthenticated, loading, router, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <TataSteelLogo size="lg" variant="icon" className="mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Tata Steel System...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
    const punchIns = todayRecords.filter((r) => r.status === "punched-in")
    const punchOuts = todayRecords.filter((r) => r.status === "punched-out")

    if (punchIns.length > punchOuts.length) {
      router.push("/punch-out")
    } else {
      logout()
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.08)_1px,transparent_0)] bg-[length:24px_24px]"></div>

      <header className="relative z-10 bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-2">
            <div className="flex items-center space-x-6">
              <TataSteelLogo size="sm" variant="full" />
              <div className="border-l border-slate-300 pl-6">
                <p className="text-base font-bold text-blue-800">Canteen Management System</p>
                <p className="text-sm text-slate-500 font-medium">MTS Project Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right bg-blue-50/50 px-4 py-2 rounded-lg border border-blue-100">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-blue-700 font-semibold">SP No: {user.spNo}</p>
              </div>
              <Badge
                variant="secondary"
                className="capitalize bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 font-semibold px-3 py-1"
              >
                {user.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-blue-300 hover:bg-blue-50 bg-white/80 backdrop-blur-sm font-semibold transition-all duration-200 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Welcome to Your Dashboard</h1>
          <p className="text-slate-600 text-xl font-medium">Canteen Operations Monitoring System</p>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-green-200">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-sm"></div>
              <span className="text-slate-700 font-medium">
                <span className="font-bold text-green-700">Location:</span> {user.locationName}
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-200">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm"></div>
              <span className="text-slate-700 font-medium">
                <span className="font-bold text-blue-700">Canteen:</span> {user.canteenName}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 via-white to-green-50/50 hover:from-green-100 hover:to-green-50 transform hover:scale-105 shadow-lg"
            onClick={() => router.push("/punch-in")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-green-800">Punch In</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-1">Start Shift</div>
              <CardDescription className="text-green-600 font-medium">
                Record your attendance for meal service
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-50 via-white to-red-50/50 hover:from-red-100 hover:to-red-50 transform hover:scale-105 shadow-lg"
            onClick={() => router.push("/punch-out")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-red-800">Punch Out</CardTitle>
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 mb-1">End Shift</div>
              <CardDescription className="text-red-600 font-medium">
                Complete your attendance for the day
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 hover:from-orange-100 hover:to-orange-50 transform hover:scale-105 shadow-lg"
            onClick={() => router.push("/meal-booking")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-orange-800">Meal Booking</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Utensils className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 mb-1">Book Meals</div>
              <CardDescription className="text-orange-600 font-medium">Fast Track & Smart Meal booking</CardDescription>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 hover:from-blue-100 hover:to-blue-50 transform hover:scale-105 shadow-lg"
            onClick={() => router.push("/attendance-report")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-blue-800">Attendance Report</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 mb-1">Reports</div>
              <CardDescription className="text-blue-600 font-medium">
                View attendance details and export data
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            Today's Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Current Status</p>
                    <p className="font-bold text-lg text-slate-900">{todayStats.currentStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Active Meal</p>
                    <p className="font-bold text-lg text-slate-900 capitalize">{todayStats.lastMeal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Punch Ins Today</p>
                    <p className="font-bold text-lg text-slate-900">{todayStats.punchIns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Punch Outs Today</p>
                    <p className="font-bold text-lg text-slate-900">{todayStats.punchOuts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px]"></div>
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="text-2xl text-white flex items-center space-x-3">
                <TataSteelLogo size="sm" variant="icon" />
                <span className="font-bold">Tata Steel - Excellence in Operations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-blue-100 space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    Integrated canteen operations monitoring system
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    Real-time attendance tracking and meal booking validation
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    Role-based access control and automated business logic
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                    Comprehensive reporting and data export capabilities
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-blue-400">
                <p className="text-sm font-medium text-blue-200">
                  Developed by MTS Team under the guidance of Senior Management • © 2024 Tata Steel Limited
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
