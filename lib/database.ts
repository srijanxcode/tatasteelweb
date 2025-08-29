export interface VendorAttendance {
  id: string
  spNo: string
  vendorName: string
  canteenId: string
  canteenName: string
  locationId: string
  locationName: string
  mealType: "breakfast" | "lunch" | "dinner" | "snacks"
  punchInTime: string
  punchOutTime?: string
  date: string
  status: "punched-in" | "punched-out"
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  spNo: string
  name: string
  role: "vendor" | "ccs" | "ecs" | "itadmin"
  canteenId: string
  canteenName: string
  locationId: string
  locationName: string
}

export interface Canteen {
  id: string
  name: string
  locationId: string
  locationName: string
}

// Mock data for development
export const mockCanteens: Canteen[] = [
  { id: "1", name: "Main Canteen", locationId: "1", locationName: "Block A" },
  { id: "2", name: "Executive Canteen", locationId: "2", locationName: "Block B" },
  { id: "3", name: "Guest House Canteen", locationId: "3", locationName: "Guest House" },
]

export const mockUsers: User[] = [
  {
    id: "1",
    spNo: "806760",
    name: "Vendor User 1",
    role: "vendor",
    canteenId: "1",
    canteenName: "Main Canteen",
    locationId: "1",
    locationName: "Block A",
  },
  {
    id: "2",
    spNo: "806759",
    name: "Vendor User 2",
    role: "vendor",
    canteenId: "2",
    canteenName: "Executive Canteen",
    locationId: "2",
    locationName: "Block B",
  },
]

// Database operations using localStorage
export class MockDatabase {
  private static getStorageKey(table: string): string {
    return `tata_steel_${table}`
  }

  static getVendorAttendance(): VendorAttendance[] {
    const data = localStorage.getItem(this.getStorageKey("vendor_attendance"))
    return data ? JSON.parse(data) : []
  }

  static saveVendorAttendance(records: VendorAttendance[]): void {
    localStorage.setItem(this.getStorageKey("vendor_attendance"), JSON.stringify(records))
  }

  static addAttendanceRecord(record: Omit<VendorAttendance, "id" | "createdAt" | "updatedAt">): VendorAttendance {
    const records = this.getVendorAttendance()
    const newRecord: VendorAttendance = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    records.push(newRecord)
    this.saveVendorAttendance(records)
    return newRecord
  }

  static updateAttendanceRecord(id: string, updates: Partial<VendorAttendance>): VendorAttendance | null {
    const records = this.getVendorAttendance()
    const index = records.findIndex((r) => r.id === id)
    if (index === -1) return null

    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() }
    this.saveVendorAttendance(records)
    return records[index]
  }

  static getAttendanceBySpNo(spNo: string, date?: string): VendorAttendance[] {
    const records = this.getVendorAttendance()
    return records.filter((r) => {
      const matchesSpNo = r.spNo === spNo
      const matchesDate = date ? r.date === date : true
      return matchesSpNo && matchesDate
    })
  }

  static getAttendanceByCanteen(canteenId: string, dateFrom: string, dateTo: string): VendorAttendance[] {
    const records = this.getVendorAttendance()
    return records.filter((r) => {
      const matchesCanteen = r.canteenId === canteenId
      const matchesDateRange = r.date >= dateFrom && r.date <= dateTo
      return matchesCanteen && matchesDateRange
    })
  }

  static getUserBySpNo(spNo: string): User | null {
    return mockUsers.find((u) => u.spNo === spNo) || null
  }

  static getCanteens(): Canteen[] {
    return mockCanteens
  }

  // Check if vendor can punch in (business logic)
  static canPunchIn(
    spNo: string,
    date: string,
    mealType: string,
    locationId: string,
  ): {
    canPunch: boolean
    message: string
  } {
    const todayRecords = this.getAttendanceBySpNo(spNo, date)

    // Check if already punched in for different location on same date and meal
    const conflictingRecord = todayRecords.find(
      (r) => r.mealType === mealType && r.locationId !== locationId && r.status === "punched-in",
    )

    if (conflictingRecord) {
      return {
        canPunch: false,
        message: `Already punched in at ${conflictingRecord.locationName} for ${mealType}. Cannot punch in at different location.`,
      }
    }

    return { canPunch: true, message: "Can punch in" }
  }

  // Check if vendor can punch out
  static canPunchOut(
    spNo: string,
    date: string,
    mealType: string,
  ): {
    canPunch: boolean
    message: string
    recordId?: string
  } {
    const todayRecords = this.getAttendanceBySpNo(spNo, date)
    const punchInRecord = todayRecords.find((r) => r.mealType === mealType && r.status === "punched-in")

    if (!punchInRecord) {
      return {
        canPunch: false,
        message: "No punch-in record found for this meal type today.",
      }
    }

    return {
      canPunch: true,
      message: "Can punch out",
      recordId: punchInRecord.id,
    }
  }
}
