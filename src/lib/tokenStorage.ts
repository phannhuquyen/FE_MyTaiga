/**
 * src/lib/tokenStorage.ts
 * Quản lý lưu trữ trạng thái xác thực và thông tin người dùng trong LocalStorage.
 *
 * Các trường được lưu trữ:
 * - mytaiga_access_token : JWT token dùng cho các API request
 * - mytaiga_user_info    : Đối tượng thông tin người dùng (userId, email, fullName, role, avatar)
 * - mytaiga_user_id      : ID của người dùng hiện tại (tiện lợi dùng cho các API call theo id)
 * - mytaiga_user_role    : Quyền hệ thống ('ADMIN' | 'USER')
 */

const STORAGE_KEYS = {
  TOKEN: 'mytaiga_access_token',
  USER_INFO: 'mytaiga_user_info',
  USER_ID: 'mytaiga_user_id',
  USER_ROLE: 'mytaiga_user_role',
} as const

export interface StoredUserInfo {
  userId: number | string
  fullName: string
  email: string
  systemRole: string
  avatar?: string | null
}

export const authStorage = {
  // ── TOKEN ────────────────────────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  },

  hasToken(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  // ── USER INFO ────────────────────────────────────────────────────────────
  getUser(): StoredUserInfo | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    if (!raw) return null
    try {
      return JSON.parse(raw) as StoredUserInfo
    } catch {
      return null
    }
  },

  setUser(user: StoredUserInfo): void {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
    localStorage.setItem(STORAGE_KEYS.USER_ID, String(user.userId))
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, user.systemRole)
  },

  getUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ID)
  },

  getUserRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE)
  },

  // ── CLEAR ALL AUTH DATA ──────────────────────────────────────────────────
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.USER_ID)
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
  },
}

/** Tương thích ngược với các module đang import tokenStorage */
export const tokenStorage = {
  get(): string | null {
    return authStorage.getToken()
  },
  set(token: string): void {
    authStorage.setToken(token)
  },
  remove(): void {
    authStorage.clearAll()
  },
  exists(): boolean {
    return authStorage.hasToken()
  },
}
