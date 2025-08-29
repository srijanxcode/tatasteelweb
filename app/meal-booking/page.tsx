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
import { ArrowLeft, Utensils, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function MealBookingPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [bookingType, setBookingType] = useState<"fast-track" | "smart-meal" | "">("")
  const [mealType, setMealType] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "">("")
  const [showPunchInButton, setShowPunchInButton] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }

    // Check if user is punched in for today
    if (user) {
      checkPunchInStatus()
    }
  }, [isAuthenticated, loading, router, user])

  const checkPunchInStatus = () => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]
    const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
    const activePunchIns = todayRecords.filter((r) => r.status === "punched-in")

    if (activePunchIns.length === 0) {
      setMessage("You must punch in before booking meals. Please complete your punch-in first.")
      setMessageType("warning")
      setShowPunchInButton(true)
      return false
    }

    return true
  }

  const checkMealTypePunchIn = (selectedMealType: string) => {
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]
    const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
    const mealPunchIn = todayRecords.find(
      (r) => r.mealType === selectedMealType && r.status === "punched-in" && r.date === today,
    )

    if (!mealPunchIn) {
      setMessage(`You have not punched in for ${selectedMealType}. Please punch in for this meal type first.`)
      setMessageType("error")
      setShowPunchInButton(true)
      return false
    }

    return true
  }

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setMessageType("")
    setShowPunchInButton(false)

    try {
      // Check if user is punched in
      if (!checkPunchInStatus()) {
        setIsSubmitting(false)
        return
      }

      // Check if user is punched in for the specific meal type
      if (!checkMealTypePunchIn(mealType)) {
        setIsSubmitting(false)
        return
      }

      // Simulate booking process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage(
        `${bookingType === "fast-track" ? "Fast Track" : "Smart Meal"} booking successful! ${quantity} ${mealType} meal(s) booked.`,
      )
      setMessageType("success")

      // Reset form
      setBookingType("")
      setMealType("")
      setQuantity("1")
    } catch (error) {
      setMessage("An error occurred while processing your booking. Please try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePunchInRedirect = () => {
    router.push("/punch-in")
  }

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
                <h1 className="text-xl font-bold text-gray-900">Meal Booking</h1>
                <p className="text-sm text-gray-500">Book your meals</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Booking System</h2>
          <p className="text-gray-600">Book your meals using Fast Track or Smart Meal options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  <span>Book Your Meal</span>
                </CardTitle>
                <CardDescription>Select booking type and meal preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookingType">Booking Type</Label>
                      <Select
                        value={bookingType}
                        onValueChange={(value: "fast-track" | "smart-meal") => setBookingType(value)}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select booking type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast-track">Fast Track Booking</SelectItem>
                          <SelectItem value="smart-meal">Smart Meal Booking</SelectItem>
                        </SelectContent>
                      </Select>
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

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  {message && (
                    <Alert
                      variant={
                        messageType === "error" ? "destructive" : messageType === "warning" ? "default" : "default"
                      }
                    >
                      {messageType === "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : messageType === "warning" ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !bookingType || !mealType || showPunchInButton}
                      className="flex-1"
                    >
                      {isSubmitting ? "Processing..." : "Book Meal"}
                    </Button>
                    {showPunchInButton && (
                      <Button
                        type="button"
                        onClick={handlePunchInRedirect}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Go to Punch In
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 mb-1">Punch-In Required</p>
                  <p className="text-blue-700">You must punch in before booking any meals</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800 mb-1">Meal-Specific Punch-In</p>
                  <p className="text-green-700">Punch in for the specific meal type you want to book</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800 mb-1">Location Restriction</p>
                  <p className="text-orange-700">You can only serve at your assigned location</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Canteen</p>
                  <p className="font-semibold">{user.canteenName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{user.locationName}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700 space-y-2">
                <p>• Fast Track Booking: Quick meal booking for immediate service</p>
                <p>• Smart Meal Booking: Advanced booking with meal planning</p>
                <p>• Both require valid punch-in for the meal type</p>
                <p>• Maximum 10 meals can be booked at once</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
