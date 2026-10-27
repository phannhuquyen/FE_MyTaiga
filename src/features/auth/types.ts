export interface AuthUser {
  id: string
  name: string
  email: string
  /** "Quản trị viên" | "Thành viên" — map từ systemRole của BE */
  role: string
  /** Vai trò hệ thống gốc từ BE ('ADMIN' | 'USER') */
  systemRole?: 'ADMIN' | 'USER'
  /** URL ảnh đại diện từ BE (yêu cầu Bearer token để load) */
  avatar?: string
  /** 2 ký tự đầu tên, dùng khi chưa có ảnh */
  avatarCode: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  attemptsLeft: number
  isLocked: boolean
  lastLoggedOutUser?: {
    email: string
    timestamp: string
  } | null
}

export interface ResetPasswordRequest {
  email: string
}

export interface SetNewPasswordRequest {
  token?: string
  password: string
  confirmPassword: string
}
