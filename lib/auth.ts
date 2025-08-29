import { type User, MockDatabase } from "./database"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export class AuthService {
  private static STORAGE_KEY = "tata_steel_auth"

  static getAuthState(): AuthState {
    if (typeof window === "undefined") {
      return { user: null, isAuthenticated: false }
    }

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        user: parsed.user,
        isAuthenticated: !!parsed.user,
      }
    }
    return { user: null, isAuthenticated: false }
  }

  static async login(
    spNo: string,
    password: string,
  ): Promise<{
    success: boolean
    user?: User
    message: string
  }> {
    // Mock authentication - in real system this would validate against database
    const user = MockDatabase.getUserBySpNo(spNo)

    if (!user) {
      return {
        success: false,
        message: "Invalid SP Number. Please check your credentials.",
      }
    }

    // Mock password validation (in real system, this would be hashed)
    if (password !== "tata123") {
      return {
        success: false,
        message: "Invalid password. Please check your credentials.",
      }
    }

    // Store auth state
    const authState: AuthState = {
      user,
      isAuthenticated: true,
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState))

    return {
      success: true,
      user,
      message: "Login successful",
    }
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static requireAuth(): User | null {
    const authState = this.getAuthState()
    return authState.isAuthenticated ? authState.user : null
  }
}
