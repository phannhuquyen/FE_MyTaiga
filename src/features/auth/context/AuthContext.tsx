import { useState, useEffect, type ReactNode } from 'react'
import type { AuthState, AuthUser, LoginCredentials } from '../types'
import { authService } from '../services/authService'
import { AuthContext } from './authContextDef'
import { authStorage } from '@/lib/tokenStorage'
import { api } from '@/services/api'

function buildAvatarCode(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  return parts.length > 1
    ? `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : fullName.slice(0, 2).toUpperCase()
}

// Lấy thông tin user đã lưu tạm từ localStorage để khởi tạo state nhanh chóng
const cachedToken = authStorage.getToken()
const cachedUser = authStorage.getUser()

const INITIAL_STATE: AuthState = {
  isAuthenticated: !!cachedToken,
  user: cachedUser
    ? {
        id: String(cachedUser.userId),
        name: cachedUser.fullName,
        email: cachedUser.email,
        role: cachedUser.systemRole === 'ADMIN' ? 'Quản trị viên' : 'Thành viên',
        avatarCode: buildAvatarCode(cachedUser.fullName),
        avatar: cachedUser.avatar ?? undefined,
      }
    : null,
  token: cachedToken,
  isLoading: !!cachedToken,
  error: null,
  attemptsLeft: 5,
  isLocked: false,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE)

  useEffect(() => {
    const savedToken = authStorage.getToken()
    if (!savedToken) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    api.users
      .getMe()
      .then((res) => {
        const { data } = res
        const user: AuthUser = {
          id: String(data.userId),
          name: data.fullName,
          email: data.email,
          role: data.systemRole === 'ADMIN' ? 'Quản trị viên' : 'Thành viên',
          avatarCode: buildAvatarCode(data.fullName),
          avatar: data.avatar ?? undefined,
        }

        // Cập nhật lại thông tin mới nhất vào localStorage
        authStorage.setUser({
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          systemRole: data.systemRole,
          avatar: data.avatar,
        })

        setState({
          isAuthenticated: true,
          user,
          token: savedToken,
          isLoading: false,
          error: null,
          attemptsLeft: 5,
          isLocked: false,
        })
      })
      .catch(() => {
        authStorage.clearAll()
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
          attemptsLeft: 5,
          isLocked: false,
        })
      })
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { user, token } = await authService.login(credentials)

      // Lấy thêm thông tin avatar từ users/me
      const meRes = await api.users.getMe()
      const meData = meRes.data
      const fullUser: AuthUser = {
        ...user,
        avatar: meData.avatar ?? undefined,
      }

      // Cập nhật lại localStorage với thông tin đầy đủ
      authStorage.setUser({
        userId: meData.userId,
        fullName: meData.fullName,
        email: meData.email,
        systemRole: meData.systemRole,
        avatar: meData.avatar,
      })

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: fullUser,
        token,
        isLoading: false,
        error: null,
        attemptsLeft: 5,
        isLocked: false,
      }))
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { status?: number; data?: { message?: string } }
        message?: string
      }

      const status = errorObj.response?.status
      const beMessage = errorObj.response?.data?.message

      if (status === 400 && beMessage?.toLowerCase().includes('khóa')) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLocked: true,
          error: 'Tài khoản đã bị khóa.',
        }))
        const lockedErr = new Error('ACCOUNT_LOCKED') as Error & { code: string }
        lockedErr.code = 'ACCOUNT_LOCKED'
        throw lockedErr
      }

      // Bắt lỗi kết nối mạng (Network Error)
      const isNetworkError = !errorObj.response && (errorObj.message?.includes('Network Error') || errorObj.message?.includes('ERR_CONNECTION'))
      const fallbackMsg = isNetworkError
        ? 'Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra Backend đã chạy chưa.'
        : 'Email hoặc mật khẩu không đúng.'

      const remaining = state.attemptsLeft - 1
      setState((prev) => ({
        ...prev,
        isLoading: false,
        attemptsLeft: remaining,
        error: beMessage || fallbackMsg,
      }))
      throw err
    }
  }

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    const currentEmail = state.user?.email ?? ''
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
        timestamp: `${new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })}, Hôm nay`,
      },
    }))
  }

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  const updateUser = (updated: Partial<AuthUser>) => {
    setState((prev) => {
      if (!prev.user) return prev
      return { ...prev, user: { ...prev.user, ...updated } }
    })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
