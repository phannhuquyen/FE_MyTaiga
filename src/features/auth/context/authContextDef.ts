import { createContext } from 'react'
import type { AuthState, AuthUser, LoginCredentials } from '../types'

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  updateUser: (updated: Partial<AuthUser>) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
