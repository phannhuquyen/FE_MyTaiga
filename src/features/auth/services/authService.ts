import type {
  AuthUser,
  LoginCredentials,
  ResetPasswordRequest,
  SetNewPasswordRequest,
} from '../types'

const MOCK_USERS: Record<string, { user: AuthUser; password: string; isLocked?: boolean }> = {
  'quannm@techcorp.vn': {
    user: {
      id: 'usr-001',
      name: 'Nguyễn Minh Quân',
      email: 'quannm@techcorp.vn',
      role: 'Quản lý dự án',
      avatarCode: 'MQ',
    },
    password: 'Password123',
  },
  'admin@scrumflow.io': {
    user: {
      id: 'usr-000',
      name: 'Quản trị viên',
      email: 'admin@scrumflow.io',
      role: 'Super Admin',
      avatarCode: 'AD',
    },
    password: 'Password123',
  },
  'locked@techcorp.vn': {
    user: {
      id: 'usr-locked',
      name: 'Tài khoản Đã khóa',
      email: 'locked@techcorp.vn',
      role: 'Thành viên',
      avatarCode: 'LK',
    },
    password: 'Password123',
    isLocked: true,
  },
}

let failedAttemptsCount: Record<string, number> = {}

export const authService = {
  /**
   * Authenticate with email & password.
   * Supports demo credentials:
   * - quannm@techcorp.vn / Password123
   * - admin@scrumflow.io / Password123
   * - locked@techcorp.vn / Password123 (triggers locked screen)
   */
  async login(
    credentials: LoginCredentials,
  ): Promise<{ user: AuthUser; token: string }> {
    // Simulate slight network latency
    await new Promise((r) => setTimeout(r, 400))

    const emailKey = credentials.email.trim().toLowerCase()
    const target = MOCK_USERS[emailKey]

    if (target?.isLocked) {
      const error = new Error('ACCOUNT_LOCKED')
      ;(error as unknown as { code: string }).code = 'ACCOUNT_LOCKED'
      throw error
    }

    if (!target || target.password !== credentials.password) {
      failedAttemptsCount[emailKey] = (failedAttemptsCount[emailKey] || 0) + 1
      const attemptsUsed = failedAttemptsCount[emailKey]
      const remaining = Math.max(0, 5 - attemptsUsed)

      if (remaining === 0) {
        if (target) target.isLocked = true
        const error = new Error('ACCOUNT_LOCKED')
        ;(error as unknown as { code: string }).code = 'ACCOUNT_LOCKED'
        throw error
      }

      const error = new Error(`Email hoặc mật khẩu không đúng. Bạn còn ${remaining} lần thử.`)
      ;(error as unknown as { code: string; attemptsLeft: number }).code = 'INVALID_CREDENTIALS'
      ;(error as unknown as { attemptsLeft: number }).attemptsLeft = remaining
      throw error
    }

    // Success
    delete failedAttemptsCount[emailKey]
    return {
      user: target.user,
      token: `mock-jwt-token-${target.user.id}-${Date.now()}`,
    }
  },

  /**
   * Send password reset email.
   */
  async requestPasswordReset(_req: ResetPasswordRequest): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 350))
    return { success: true }
  },

  /**
   * Reset to new password.
   */
  async resetPassword(_req: SetNewPasswordRequest): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 400))
    return { success: true }
  },

  /**
   * Log out current session.
   */
  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200))
  },
}
