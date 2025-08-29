"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { MockDatabase } from "@/lib/database"
import { TataSteelLogo } from "@/components/tata-steel-logo"
import { ArrowLeft, Clock, MapPin, User, LogOut, CheckCircle, AlertCircle, XCircle } from "lucide-react"

export default function PunchOutPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [spNo, setSpNo] = useState("")
  const [mealType, setMealType] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLogoutButton, setShowLogoutButton] = useState(false)
  const [punchInCount, setPunchInCount] = useState(0)
  const [punchOutCount, setPunchOutCount] = useState(0)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
    if (user) {
      setSpNo(user.spNo)
      // Get today's punch records to show counts
      const today = new Date().toISOString().split("T")[0]
      const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
      const punchIns = todayRecords.filter((r) => r.status === "punched-in").length
      const punchOuts = todayRecords.filter((r) => r.status === "punched-out").length
      setPunchInCount(punchIns)
      setPunchOutCount(punchOuts)
    }
  }, [isAuthenticated, loading, router, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const handlePunchOut = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setMessageType("")

    try {
      const today = new Date().toISOString().split("T")[0]

      // Validate SP Number matches logged in user
      if (spNo !== user.spNo) {
        setMessage("SP Number does not match your login credentials.")
        setMessageType("error")
        setIsSubmitting(false)
        setShowLogoutButton(true)
        return
      }

      // Check if can punch out (business logic)
      const canPunchOutResult = MockDatabase.canPunchOut(spNo, today, mealType)

      if (!canPunchOutResult.canPunch) {
        setMessage(canPunchOutResult.message)
        setMessageType("error")
        setIsSubmitting(false)
        setShowLogoutButton(true)
        return
      }

      // Update the punch-in record to punch-out
      if (canPunchOutResult.recordId) {
        const updatedRecord = MockDatabase.updateAttendanceRecord(canPunchOutResult.recordId, {
          punchOutTime: new Date().toISOString(),
          status: "punched-out",
        })

        if (updatedRecord) {
          setMessage("Punch-Out Successful! Your shift has been completed.")
          setMessageType("success")
          setShowLogoutButton(true)
          // Update counts
          setPunchOutCount((prev) => prev + 1)
        } else {
          setMessage("Failed to record punch-out. Please try again.")
          setMessageType("error")
          setShowLogoutButton(true)
        }
      }
    } catch (error) {
      setMessage("An error occurred while processing punch-out. Please try again.")
      setMessageType("error")
      setShowLogoutButton(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getCurrentTime = () => {
    return new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canPunchOutMore = punchInCount > punchOutCount

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <TataSteelLogo size="sm" variant="compact" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vendor Punch-Out</h1>
                <p className="text-sm text-gray-500">Complete your attendance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">SP No: {user.spNo}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Punch Out</h2>
          <p className="text-gray-600">Complete your shift and record your departure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Punch-Out Details</span>
                </CardTitle>
                <CardDescription>Fill in the required information to complete your attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePunchOut} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spNo">SP Number</Label>
                      <Input
                        id="spNo"
                        type="text"
                        value={spNo}
                        onChange={(e) => setSpNo(e.target.value)}
                        placeholder="Enter SP Number"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Select value={mealType} onValueChange={setMealType} required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snacks">Snacks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {message && (
                    <Alert variant={messageType === "error" ? "destructive" : "default"}>
                      {messageType === "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !mealType || showLogoutButton}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? "Processing..." : "Punch Out"}
                    </Button>
                    {showLogoutButton && (
                      <Button type="button" onClick={handleLogout} variant="outline" className="flex-1 bg-transparent">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
                    )}
                  </div>

                  {!canPunchOutMore && punchOutCount > 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Maximum punch-outs completed for today. You can now log out safely.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Your Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">SP Number</p>
                  <p className="font-semibold">{user.spNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>Location Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{user.locationName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Canteen</p>
                  <p className="font-semibold">{user.canteenName}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Location and Canteen are fixed with your User ID</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Today's Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{punchInCount}</p>
                    <p className="text-sm text-green-700">Punch Ins</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{punchOutCount}</p>
                    <p className="text-sm text-red-700">Punch Outs</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-lg font-semibold">{getCurrentTime()}</p>
                  <p className="text-sm text-gray-500">IST (Indian Standard Time)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <LogOut className="h-5 w-5" />
                  <span>Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-700 space-y-2">
                <p>• Ensure your SP Number matches your login</p>
                <p>• Select the meal type you want to punch out from</p>
                <p>• You can only punch out if you have punched in</p>
                <p>• Multiple punch-outs allowed based on punch-ins</p>
                <p>• Log out button will appear after punch-out</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
