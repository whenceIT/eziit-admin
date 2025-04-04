import axios from "axios"
import type { User } from "@/types/user"
import Cookies from "js-cookie" 

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"
const TOKEN_KEY = "auth-token"
const USER_DATA_KEY = "user-data"

export interface SignUpParams {
  first_name: string
  last_name: string
  email: string
  password: string
  user_type: string
  organisation_name: string
}

export interface SignInParams {
  email: string
  password: string
}

class AuthClient {
  private token: string | null = null
  private user: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(TOKEN_KEY) || Cookies.get(TOKEN_KEY) || null
      const userData = localStorage.getItem(USER_DATA_KEY)
      if (userData) {
        this.user = JSON.parse(userData)
      }
    }
  }

  private setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
      Cookies.set(TOKEN_KEY, token, { expires: 7 }) //sets cookie to expire in 7 days
    }
  }

  private setUser(user: User) {
    this.user = user
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
    }
  }

  private clearToken() {
    this.token = null
    this.user = null
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_DATA_KEY)
      Cookies.remove(TOKEN_KEY)
    }
  }

  async signUp(params: SignUpParams): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/create-user`, params)
    const { token, user } = response.data
    this.setToken(token)
    this.setUser(user)
    return user
  }

  async signIn(params: SignInParams): Promise<User> {
    try {
      const response = await axios.post(`${API_BASE_URL}/sign-in`, params)
      const { token, user } = response.data
      this.setToken(token)
      this.setUser(user)
      return user
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.response || "Failed to sign in")
      }
      throw new Error("An unexpected error occurred")
    }
  }

  async getUser(): Promise<User | null> {
    if (this.user) return this.user
    if (!this.token) return null

    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      this.setUser(response.data)
      return response.data
    } catch (error) {
      console.error("Failed to fetch user:", error)
      this.clearToken()
      return null
    }
  }

  signOut(): void {
    this.clearToken()
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    if (!this.token) throw new Error("No authentication token found")

    try {
      const response = await axios.put(`${API_BASE_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      this.setUser(response.data)
      return response.data
    } catch (error) {
      console.error("Failed to update user:", error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }
}

export const authClient = new AuthClient()

