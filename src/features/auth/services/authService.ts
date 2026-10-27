/**
 * src/features/auth/services/authService.ts
 * Adapter kết nối tầng UI/Feature với file API tập trung (src/services/api.ts).
 */

import { api } from '@/services/api'
import { authStorage } from '@/lib/tokenStorage'
import type { AuthUser, LoginCredentials, ResetPasswordRequest, SetNewPasswordRequest } from '../types'

function mapBeUserToAuthUser(beUser: { userId: number; fullName: string; email: string; systemRole: string }): AuthUser {
  const nameParts = beUser.fullName.trim().split(/\s+/)
  const initials =
    nameParts.length > 1
      ? `${nameParts[nameParts.length - 2][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : beUser.fullName.slice(0, 2).toUpperCase()

  return {
    id: String(beUser.userId),
    name: beUser.fullName,
    email: beUser.email,
    role: beUser.systemRole === 'ADMIN' ? 'Quản trị viên' : 'Thành viên',
    systemRole: beUser.systemRole as 'ADMIN' | 'USER',
    avatarCode: initials,
  }
}

export const authService = {
  /**
   * Đăng nhập
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const res = await api.auth.login({
      email: credentials.email.trim(),
      password: credentials.password,
    })

    const { accessToken, user: beUser } = res.data
    // Lưu token và thông tin user lên localStorage
    authStorage.setToken(accessToken)
    authStorage.setUser({
      userId: beUser.userId,
      fullName: beUser.fullName,
      email: beUser.email,
      systemRole: beUser.systemRole,
    })

    return {
      user: mapBeUserToAuthUser(beUser),
      token: accessToken,
    }
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await api.auth.logout()
    } catch (err) {
      console.warn('⚠️ Lỗi gọi API đăng xuất nhưng vẫn dọn token FE:', err)
    } finally {
      authStorage.clearAll()
    }
  },

  /**
   * Quên mật khẩu
   */
  async requestPasswordReset(req: ResetPasswordRequest): Promise<{ success: boolean }> {
    const res = await api.auth.forgotPassword({
      email: req.email.trim(),
    })
    return { success: res.success }
  },

  /**
   * Đặt lại mật khẩu mới
   */
  async resetPassword(req: SetNewPasswordRequest): Promise<{ success: boolean }> {
    const res = await api.auth.resetPassword({
      token: req.token || '',
      newPassword: req.password,
      confirmPassword: req.confirmPassword,
    })
    return { success: res.success }
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean }> {
    const res = await api.auth.changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    return { success: res.success }
  },
}
