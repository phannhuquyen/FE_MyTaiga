export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
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
