import type {
  UpdateAvatarPayload,
  UpdateContactPayload,
  UpdateNamePayload,
  UserProfile,
} from '../types'

const INITIAL_PROFILE: UserProfile = {
  id: 'SB-USR-0941',
  fullName: 'Nguyễn Minh Quân',
  email: 'quan.nguyen@techcorp.vn',
  isEmailVerified: true,
  phone: '+84 912 345 678',
  role: 'Quản lý dự án (Project Manager)',
  roleBadge: 'Quản lý dự án',
  department: 'Phòng Phát triển Giải pháp',
  accountType: 'Tài khoản chuẩn doanh nghiệp',
  joinDate: '14/03/2023',
  joinDuration: '1 năm 8 tháng',
  timezone: 'GMT+7 (Asia/Ho_Chi_Minh)',
  language: 'Tiếng Việt',
  avatarCode: 'MQ',
  avatarUrl: undefined,
  lastSessionUpdate: '10:42 hôm nay trên macOS / Chrome',
  lastProfileUpdate: '28/10/2024',
  status: 'active',
}

class ProfileService {
  private profile: UserProfile = { ...INITIAL_PROFILE }

  async getProfile(): Promise<UserProfile> {
    // Simulate brief network latency
    await new Promise((resolve) => setTimeout(resolve, 80))
    return { ...this.profile }
  }

  async updateName(payload: UpdateNamePayload): Promise<UserProfile> {
    const trimmed = payload.fullName.trim()
    if (!trimmed || trimmed.length < 2) {
      throw new Error('Họ và tên không được để trống và phải có ít nhất 2 ký tự.')
    }

    await new Promise((resolve) => setTimeout(resolve, 120))

    // Generate avatar code from name (e.g. "Nguyễn Minh Quân" -> "MQ")
    const parts = trimmed.split(/\s+/).filter(Boolean)
    const initials = parts.length > 1
      ? `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : trimmed.slice(0, 2).toUpperCase()

    this.profile = {
      ...this.profile,
      fullName: trimmed,
      avatarCode: initials,
      lastProfileUpdate: 'Vừa xong',
    }

    return { ...this.profile }
  }

  async updateContact(payload: UpdateContactPayload): Promise<UserProfile> {
    const trimmedEmail = payload.email.trim()
    const trimmedPhone = payload.phone.trim()

    // Strict email check matching reference error case
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Email không hợp lệ. Vui lòng nhập đúng định dạng name@company.com')
    }

    // Phone format check (E.164-ish)
    const phoneClean = trimmedPhone.replace(/[\s-]/g, '')
    const phoneRegex = /^\+?[0-9]{9,15}$/
    if (!phoneRegex.test(phoneClean)) {
      throw new Error('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng E.164 (VD: +84 912 345 678).')
    }

    await new Promise((resolve) => setTimeout(resolve, 150))

    this.profile = {
      ...this.profile,
      email: trimmedEmail,
      phone: trimmedPhone,
      lastProfileUpdate: 'Vừa xong',
    }

    return { ...this.profile }
  }

  async updateAvatar(payload: UpdateAvatarPayload): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    this.profile = {
      ...this.profile,
      avatarUrl: payload.avatarUrl,
      lastProfileUpdate: 'Vừa xong',
    }

    return { ...this.profile }
  }

  async syncSession(): Promise<{ lastSessionUpdate: string }> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const now = new Date()
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const updated = `${timeStr} hôm nay trên Web / Browser`

    this.profile = {
      ...this.profile,
      lastSessionUpdate: updated,
    }

    return { lastSessionUpdate: updated }
  }
}

export const profileService = new ProfileService()
