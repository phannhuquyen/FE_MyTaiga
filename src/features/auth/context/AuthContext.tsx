import { useState, type ReactNode } from 'react'
import type { AuthState, AuthUser, LoginCredentials } from '../types'
import { authService } from '../services/authService'
import { AuthContext } from './authContextDef'

const DEFAULT_USER: AuthUser = {
  id: 'usr-000',
  name: 'ADMIN',
  email: 'admin@scrumflow.io',
  role: 'Quản trị viên',
  avatarCode: 'AD',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: true, // Default to true for easy prototype navigation, but full login flow works
    user: DEFAULT_USER,
    token: 'mock-session-token',
    isLoading: false,
    error: null,
    attemptsLeft: 5,
    isLocked: false,
    lastLoggedOutUser: {
      email: 'quannm@techcorp.vn',
      timestamp: '17:30, Hôm nay',
    },
  })

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { user, token } = await authService.login(credentials)
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
        attemptsLeft: 5,
        isLocked: false,
      }))
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string; attemptsLeft?: number }
      if (errorObj.code === 'ACCOUNT_LOCKED') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLocked: true,
          error: 'Tài khoản đã bị khóa do nhập sai mật khẩu quá 5 lần liên tiếp.',
        }))
        throw err
      }

      const attempts = errorObj.attemptsLeft ?? 3
      setState((prev) => ({
        ...prev,
        isLoading: false,
        attemptsLeft: attempts,
        error: errorObj.message || 'Email hoặc mật khẩu không đúng.',
      }))
      throw err
    }
  }

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    const currentEmail = state.user?.email || 'quannm@techcorp.vn'
    await authService.logout()
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      lastLoggedOutUser: {
        email: currentEmail,
        timestamp: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, Hôm nay`,
      },
    }))
  }

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  const updateUser = (updated: Partial<AuthUser>) => {
    setState((prev) => {
      if (!prev.user) return prev
      return {
        ...prev,
        user: { ...prev.user, ...updated },
      }
    })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
