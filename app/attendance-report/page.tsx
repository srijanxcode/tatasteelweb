"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { MockDatabase, type VendorAttendance } from "@/lib/database"
import { TataSteelLogo } from "@/components/tata-steel-logo"
import { ArrowLeft, FileText, Download, User, Building2, Search, Clock } from "lucide-react"

export default function AttendanceReportPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Individual Report State
  const [individualSpNo, setIndividualSpNo] = useState("")
  const [individualDateFrom, setIndividualDateFrom] = useState("")
  const [individualDateTo, setIndividualDateTo] = useState("")
  const [individualRecords, setIndividualRecords] = useState<VendorAttendance[]>([])

  // Canteen Report State
  const [selectedCanteen, setSelectedCanteen] = useState("")
  const [selectedMealType, setSelectedMealType] = useState("")
  const [canteenDateFrom, setCanteenDateFrom] = useState("")
  const [canteenDateTo, setCanteenDateTo] = useState("")
  const [canteenRecords, setCanteenRecords] = useState<VendorAttendance[]>([])

  const [activeTab, setActiveTab] = useState("individual")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
    if (user) {
      setIndividualSpNo(user.spNo)
      setSelectedCanteen(user.canteenId)
      // Set default date range to current month
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setIndividualDateFrom(firstDay.toISOString().split("T")[0])
      setIndividualDateTo(lastDay.toISOString().split("T")[0])
      setCanteenDateFrom(firstDay.toISOString().split("T")[0])
      setCanteenDateTo(lastDay.toISOString().split("T")[0])
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

  const handleIndividualSearch = () => {
    if (!individualSpNo || !individualDateFrom || !individualDateTo) {
      return
    }

    const allRecords = MockDatabase.getVendorAttendance()
    const filteredRecords = allRecords.filter((record) => {
      const matchesSpNo = record.spNo === individualSpNo
      const matchesDateRange = record.date >= individualDateFrom && record.date <= individualDateTo
      return matchesSpNo && matchesDateRange
    })

    setIndividualRecords(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const handleCanteenSearch = () => {
    if (!selectedCanteen || !canteenDateFrom || !canteenDateTo) {
      return
    }

    const allRecords = MockDatabase.getVendorAttendance()
    const filteredRecords = allRecords.filter((record) => {
      const matchesCanteen = record.canteenId === selectedCanteen
      const matchesMealType = selectedMealType ? record.mealType === selectedMealType : true
      const matchesDateRange = record.date >= canteenDateFrom && record.date <= canteenDateTo
      return matchesCanteen && matchesMealType && matchesDateRange
    })

    setCanteenRecords(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const exportToExcel = (records: VendorAttendance[], filename: string) => {
    const headers = [
      "Date",
      "SP No",
      "Vendor Name",
      "Canteen",
      "Location",
      "Meal Type",
      "Punch In Time",
      "Punch Out Time",
      "Status",
    ]

    const csvContent = [
      headers.join(","),
      ...records.map((record) =>
        [
          record.date,
          record.spNo,
          record.vendorName,
          record.canteenName,
          record.locationName,
          record.mealType,
          record.punchInTime ? new Date(record.punchInTime).toLocaleString() : "",
          record.punchOutTime ? new Date(record.punchOutTime).toLocaleString() : "",
          record.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const canteens = MockDatabase.getCanteens()

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
                <h1 className="text-xl font-bold text-gray-900 mb-2">Attendance Reports</h1>
                <p className="text-sm text-gray-500">View and export attendance data</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Details</h2>
          <p className="text-gray-600">Generate individual or canteen-wise attendance reports</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Individual Report</span>
            </TabsTrigger>
            <TabsTrigger value="canteen" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Canteen Report</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Individual Attendance Report</span>
                </CardTitle>
                <CardDescription>Search attendance records by SP Number and date range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="individualSpNo">SP Number</Label>
                    <Input
                      id="individualSpNo"
                      type="text"
                      value={individualSpNo}
                      onChange={(e) => setIndividualSpNo(e.target.value)}
                      placeholder="Enter SP Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="individualDateFrom">From Date</Label>
                    <Input
                      id="individualDateFrom"
                      type="date"
                      value={individualDateFrom}
                      onChange={(e) => setIndividualDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="individualDateTo">To Date</Label>
                    <Input
                      id="individualDateTo"
                      type="date"
                      value={individualDateTo}
                      onChange={(e) => setIndividualDateTo(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <Button onClick={handleIndividualSearch} className="flex-1">
                      <Search className="h-4 w-4 mr-2" />
                      Show
                    </Button>
                    {individualRecords.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => exportToExcel(individualRecords, `individual_attendance_${individualSpNo}`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {individualRecords.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Meal Type</TableHead>
                          <TableHead>Canteen</TableHead>
                          <TableHead>Punch In</TableHead>
                          <TableHead>Punch Out</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {individualRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {record.mealType}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.canteenName}</TableCell>
                            <TableCell className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span>{formatTime(record.punchInTime)}</span>
                            </TableCell>
                            <TableCell>
                              {record.punchOutTime ? (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span>{formatTime(record.punchOutTime)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={record.status === "punched-out" ? "default" : "secondary"}
                                className={
                                  record.status === "punched-out"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }
                              >
                                {record.status === "punched-out" ? "Completed" : "Active"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {individualRecords.length === 0 && individualSpNo && individualDateFrom && individualDateTo && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No attendance records found for the selected criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="canteen" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span>Canteen-wise Attendance Report</span>
                </CardTitle>
                <CardDescription>Search attendance records by canteen, meal type, and date range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="selectedCanteen">Canteen</Label>
                    <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select canteen" />
                      </SelectTrigger>
                      <SelectContent>
                        {canteens.map((canteen) => (
                          <SelectItem key={canteen.id} value={canteen.id}>
                            {canteen.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selectedMealType">Meal Type</Label>
                    <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All meals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Meals</SelectItem>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canteenDateFrom">From Date</Label>
                    <Input
                      id="canteenDateFrom"
                      type="date"
                      value={canteenDateFrom}
                      onChange={(e) => setCanteenDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canteenDateTo">To Date</Label>
                    <Input
                      id="canteenDateTo"
                      type="date"
                      value={canteenDateTo}
                      onChange={(e) => setCanteenDateTo(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <Button onClick={handleCanteenSearch} className="flex-1">
                      <Search className="h-4 w-4 mr-2" />
                      Show
                    </Button>
                    {canteenRecords.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => exportToExcel(canteenRecords, `canteen_attendance_${selectedCanteen}`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {canteenRecords.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>SP No</TableHead>
                          <TableHead>Vendor Name</TableHead>
                          <TableHead>Meal Type</TableHead>
                          <TableHead>Punch In</TableHead>
                          <TableHead>Punch Out</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {canteenRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                            <TableCell>{record.spNo}</TableCell>
                            <TableCell>{record.vendorName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {record.mealType}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span>{formatTime(record.punchInTime)}</span>
                            </TableCell>
                            <TableCell>
                              {record.punchOutTime ? (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span>{formatTime(record.punchOutTime)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={record.status === "punched-out" ? "default" : "secondary"}
                                className={
                                  record.status === "punched-out"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }
                              >
                                {record.status === "punched-out" ? "Completed" : "Active"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {canteenRecords.length === 0 && selectedCanteen && canteenDateFrom && canteenDateTo && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No attendance records found for the selected criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
