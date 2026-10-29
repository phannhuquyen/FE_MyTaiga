/**
 * src/features/profile/services/profileService.ts
 * Adapter cho chức năng hồ sơ cá nhân, gọi qua file api tập trung.
 */

import { api, API_ROOT, type UserProfileData } from '@/services/api'
import type {
  UpdateAvatarPayload,
  UpdateContactPayload,
  UpdateNamePayload,
  UserProfile,
} from '../types'

function mapMeDataToProfile(data: UserProfileData): UserProfile {
  const nameParts = data.fullName.trim().split(/\s+/)
  const initials =
    nameParts.length > 1
      ? `${nameParts[nameParts.length - 2][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : data.fullName.slice(0, 2).toUpperCase()

  const avatarUrl = data.avatar ? (/^https?:\/\//i.test(data.avatar) ? data.avatar : `${API_ROOT}${data.avatar}`) : undefined

  return {
    id: String(data.userId),
    fullName: data.fullName,
    email: data.email,
    isEmailVerified: true,
    phone: data.phoneNumber ?? '',
    role: data.systemRole === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Thành viên (Member)',
    roleBadge: data.systemRole === 'ADMIN' ? 'Quản trị viên' : 'Thành viên',
    department: '',
    accountType: 'Tài khoản hệ thống',
    joinDate: new Date(data.createdAt).toLocaleDateString('vi-VN'),
    joinDuration: '',
    timezone: 'GMT+7 (Asia/Ho_Chi_Minh)',
    language: 'Tiếng Việt',
    avatarCode: initials,
    avatarUrl,
    lastSessionUpdate: 'Vừa xong',
    lastProfileUpdate: '',
    status: 'active',
  }
}

class ProfileService {
  /**
   * Lấy hồ sơ người dùng hiện tại
   */
  async getProfile(): Promise<UserProfile> {
    const res = await api.users.getMe()
    return mapMeDataToProfile(res.data)
  }

  /**
   * Cập nhật họ tên
   */
  async updateName(payload: UpdateNamePayload): Promise<UserProfile> {
    const trimmed = payload.fullName.trim()
    if (!trimmed || trimmed.length < 2) {
      throw new Error('Họ và tên không được để trống và phải có ít nhất 2 ký tự.')
    }

    const current = await this.getProfile()

    const res = await api.users.updateMe({
      fullName: trimmed,
      email: current.email,
      phoneNumber: current.phone || null,
    })

    return {
      ...current,
      fullName: res.data.fullName,
    }
  }

  /**
   * Cập nhật email và số điện thoại
   */
  async updateContact(payload: UpdateContactPayload): Promise<UserProfile> {
    const trimmedEmail = payload.email.trim()
    const trimmedPhone = payload.phone.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Email không hợp lệ. Vui lòng nhập đúng định dạng name@company.com')
    }

    const phoneClean = trimmedPhone.replace(/[\s-]/g, '')
    const phoneRegex = /^\+?[0-9]{9,15}$/
    if (trimmedPhone && !phoneRegex.test(phoneClean)) {
      throw new Error('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng E.164 (VD: +84 912 345 678).')
    }

    const current = await this.getProfile()

    const res = await api.users.updateMe({
      fullName: current.fullName,
      email: trimmedEmail,
      phoneNumber: trimmedPhone || null,
    })

    return {
      ...current,
      email: res.data.email,
      phone: res.data.phoneNumber ?? '',
    }
  }

  /**
   * Upload ảnh đại diện mới.
   * Tự động xử lý cả File object lẫn base64 data URL từ modal upload mà không làm thay đổi UI.
   */
  async updateAvatar(payload: UpdateAvatarPayload & { file?: File }): Promise<UserProfile> {
    let fileToUpload = payload.file

    if (!fileToUpload && payload.avatarUrl && payload.avatarUrl.startsWith('data:')) {
      try {
        const arr = payload.avatarUrl.split(',')
        const mimeMatch = arr[0].match(/:(.*?);/)
        const mime = mimeMatch ? mimeMatch[1] : 'image/png'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        fileToUpload = new File([u8arr], 'avatar.png', { type: mime })
      } catch (err) {
        console.warn('Không thể parse data url của avatar:', err)
      }
    }

    if (!fileToUpload) {
      throw new Error('Chưa có tệp ảnh để lưu. Vui lòng tải ảnh từ máy; ảnh mẫu demo chưa được hỗ trợ lưu qua API.')
    }
    await api.users.uploadAvatar(fileToUpload)

    return this.getProfile()
  }

  /**
   * Đồng bộ thông tin phiên
   */
  async syncSession(): Promise<{ lastSessionUpdate: string }> {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    return { lastSessionUpdate: `${timeStr} hôm nay trên Web / Browser` }
  }
}

export const profileService = new ProfileService()
