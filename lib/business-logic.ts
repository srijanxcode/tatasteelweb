import { MockDatabase, type User } from "./database"

export class BusinessLogicService {
  // Check if vendor can access meal booking systems
  static canAccessMealBooking(user: User): {
    canAccess: boolean
    message: string
    redirectTo?: string
  } {
    const today = new Date().toISOString().split("T")[0]
    const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
    const activePunchIns = todayRecords.filter((r) => r.status === "punched-in")

    if (activePunchIns.length === 0) {
      return {
        canAccess: false,
        message: "You must punch in before accessing meal booking systems.",
        redirectTo: "/punch-in",
      }
    }

    return {
      canAccess: true,
      message: "Access granted to meal booking systems.",
    }
  }

  // Check if vendor can access specific meal type booking
  static canBookMealType(
    user: User,
    mealType: string,
  ): {
    canBook: boolean
    message: string
    redirectTo?: string
  } {
    const today = new Date().toISOString().split("T")[0]
    const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
    const mealPunchIn = todayRecords.find(
      (r) => r.mealType === mealType && r.status === "punched-in" && r.date === today,
    )

    if (!mealPunchIn) {
      return {
        canBook: false,
        message: `You have not punched in for ${mealType}. Please punch in for this meal type first.`,
        redirectTo: "/punch-in",
      }
    }

    return {
      canBook: true,
      message: `You can book ${mealType} meals.`,
    }
  }

  // Handle logout logic based on user role and punch status
  static handleLogout(user: User): {
    canLogout: boolean
    message: string
    redirectTo?: string
  } {
    // For roles ccs, ecs, itadmin - redirect directly to punch-out
    if (["ccs", "ecs", "itadmin"].includes(user.role)) {
      return {
        canLogout: false,
        message: "Redirecting to punch-out page as per your role requirements.",
        redirectTo: "/punch-out",
      }
    }

    // For vendors, check if they have unpunched shifts
    const today = new Date().toISOString().split("T")[0]
    const todayRecords = MockDatabase.getAttendanceBySpNo(user.spNo, today)
    const punchIns = todayRecords.filter((r) => r.status === "punched-in")
    const punchOuts = todayRecords.filter((r) => r.status === "punched-out")

    if (punchIns.length > punchOuts.length) {
      return {
        canLogout: false,
        message: "You have unpunched shifts. Please complete punch-out before logging out.",
        redirectTo: "/punch-out",
      }
    }

    return {
      canLogout: true,
      message: "Safe to logout.",
    }
  }

  // Validate multiple punch-in rules
  static validateMultiplePunchIn(
    user: User,
    mealType: string,
    date: string,
  ): {
    isValid: boolean
    message: string
    allowedCount: number
    currentCount: number
  } {
    const records = MockDatabase.getAttendanceBySpNo(user.spNo, date)
    const sameMealRecords = records.filter(
      (r) => r.mealType === mealType && r.locationId === user.locationId && r.date === date,
    )

    const punchInCount = sameMealRecords.filter((r) => r.status === "punched-in").length
    const punchOutCount = sameMealRecords.filter((r) => r.status === "punched-out").length

    // Allow multiple punch-ins for same location and meal type
    return {
      isValid: true,
      message: `Multiple punch-ins allowed for same location and meal type.`,
      allowedCount: -1, // Unlimited
      currentCount: punchInCount,
    }
  }

  // Generate attendance summary for reporting
  static generateAttendanceSummary(
    spNo: string,
    dateFrom: string,
    dateTo: string,
  ): {
    totalDays: number
    workedDays: number
    totalPunchIns: number
    totalPunchOuts: number
    incompleteShifts: number
    mealTypeBreakdown: Record<string, number>
  } {
    const records = MockDatabase.getVendorAttendance().filter(
      (r) => r.spNo === spNo && r.date >= dateFrom && r.date <= dateTo,
    )

    const uniqueDates = [...new Set(records.map((r) => r.date))]
    const punchIns = records.filter((r) => r.status === "punched-in")
    const punchOuts = records.filter((r) => r.status === "punched-out")

    const mealTypeBreakdown: Record<string, number> = {}
    records.forEach((r) => {
      mealTypeBreakdown[r.mealType] = (mealTypeBreakdown[r.mealType] || 0) + 1
    })

    return {
      totalDays: uniqueDates.length,
      workedDays: uniqueDates.length,
      totalPunchIns: punchIns.length,
      totalPunchOuts: punchOuts.length,
      incompleteShifts: punchIns.length - punchOuts.length,
      mealTypeBreakdown,
    }
  }
}
