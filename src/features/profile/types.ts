export interface UserProfile {
  id: string
  fullName: string
  email: string
  isEmailVerified: boolean
  phone: string
  role: string
  roleBadge: string
  department: string
  accountType: string
  joinDate: string
  joinDuration: string
  timezone: string
  language: string
  avatarUrl?: string
  avatarCode: string
  lastSessionUpdate: string
  lastProfileUpdate: string
  status: 'active' | 'offline'
}

export interface UpdateNamePayload {
  fullName: string
}

export interface UpdateContactPayload {
  email: string
  phone: string
}

export interface UpdateAvatarPayload {
  avatarUrl: string
  zoomLevel?: number
}
