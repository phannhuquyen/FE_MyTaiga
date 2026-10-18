import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui'
import type { UserProfile } from '../types'

export interface ProfileCardProps {
  profile: UserProfile
  onUpdateName: (fullName: string) => Promise<void>
  onUpdateContact: (email: string, phone: string) => Promise<void>
  onOpenAvatarModal: () => void
  onSyncSession: () => Promise<void>
}

export function ProfileCard({
  profile,
  onUpdateName,
  onUpdateContact,
  onOpenAvatarModal,
  onSyncSession,
}: ProfileCardProps) {
  // Editing state
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingContact, setIsEditingContact] = useState(false)

  // Name form state
  const [nameValue, setNameValue] = useState(profile.fullName)
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSavingName, setIsSavingName] = useState(false)

  // Contact form state
  const [emailValue, setEmailValue] = useState(profile.email)
  const [phoneValue, setPhoneValue] = useState(profile.phone)
  const [contactError, setContactError] = useState<string | null>(null)
  const [isSavingContact, setIsSavingContact] = useState(false)

  // Timezone & Language state
  const [isEditingLocale, setIsEditingLocale] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState(profile.timezone)
  const [selectedLanguage, setSelectedLanguage] = useState(profile.language)

  // Session sync state
  const [isSyncing, setIsSyncing] = useState(false)

  // Handle Save Name
  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault()
    setNameError(null)
    if (!nameValue.trim()) {
      setNameError('Họ và tên không được để trống.')
      return
    }
    try {
      setIsSavingName(true)
      await onUpdateName(nameValue)
      setIsEditingName(false)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu họ tên.')
    } finally {
      setIsSavingName(false)
    }
  }

  // Handle Save Contact
  const handleSaveContact = async (e: FormEvent) => {
    e.preventDefault()
    setContactError(null)
    try {
      setIsSavingContact(true)
      await onUpdateContact(emailValue, phoneValue)
      setIsEditingContact(false)
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật liên hệ.')
    } finally {
      setIsSavingContact(false)
    }
  }

  // Handle Sync Session
  const handleSyncSession = async () => {
    try {
      setIsSyncing(true)
      await onSyncSession()
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-whiteboard rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* ── Top Header ── */}
      <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md font-bold text-neutral-900 tracking-tight">
            Hồ sơ cá nhân
          </h1>
          <p className="text-body-sm text-neutral-500 mt-1">
            Quản lý thông tin định danh và liên hệ của bạn trên ScrumBan Flow
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-50 text-success-700 text-body-xs font-medium border border-success-200/60 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
          <span>Đang hoạt động</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* ── Avatar & Identity Block ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-xl bg-paper-50 border border-neutral-200/80">
          <div className="flex items-center gap-4">
            {/* Avatar squircle */}
            <div className="relative group shrink-0">
              <div className="w-18 h-18 rounded-2xl overflow-hidden bg-neutral-800 text-whiteboard flex items-center justify-center font-bold text-xl shadow-md border-2 border-neutral-200">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{profile.avatarCode}</span>
                )}
              </div>
              <button
                type="button"
                onClick={onOpenAvatarModal}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-whiteboard text-neutral-700 border border-neutral-300 shadow-sm flex items-center justify-center hover:bg-neutral-100 hover:text-primary-600 transition-colors cursor-pointer"
                title="Đổi ảnh đại diện"
                aria-label="Thay đổi ảnh đại diện"
              >
                <Icon name="camera" size={13} />
              </button>
            </div>

            {/* Name, Role & ID */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-headline-sm font-bold text-neutral-900">
                  {profile.fullName}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-body-xs font-semibold bg-success-50 text-primary-700 border border-primary-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  {profile.roleBadge}
                </span>
              </div>
              <div className="text-body-xs text-neutral-500 mt-1 flex flex-wrap items-center gap-2">
                <span>Mã định danh: {profile.id}</span>
                <span>•</span>
                <span>{profile.department}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAvatarModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-neutral-300 hover:border-primary-500 hover:text-primary-600 bg-whiteboard rounded-lg text-body-sm font-semibold text-neutral-700 transition-colors shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Icon name="camera" size={15} />
            <span>Thay đổi ảnh đại diện</span>
          </button>
        </div>

        {/* ── Profile Details List ── */}
        <div className="divide-y divide-neutral-200 border-y border-neutral-200 text-body-sm">
          {/* Row 1: Họ và tên */}
          <div className="py-4">
            {!isEditingName ? (
              <div className="flex items-center justify-between gap-4">
                <span className="w-36 sm:w-44 text-neutral-500 font-medium shrink-0">
                  Họ và tên
                </span>
                <span className="flex-1 font-semibold text-neutral-900">
                  {profile.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNameValue(profile.fullName)
                    setNameError(null)
                    setIsEditingName(true)
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer shrink-0 transition-colors"
                >
                  Sửa
                </button>
              </div>
            ) : (
              /* Inline Edit Mode matching 'Sửa họ tên - ScrumBan Flow.png' */
              <form onSubmit={handleSaveName} className="space-y-3 py-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="fullNameInput" className="font-semibold text-neutral-800">
                    Họ và tên
                  </label>
                  <span className="inline-flex items-center gap-1 text-body-xs font-semibold text-primary-600">
                    <Icon name="edit" size={13} />
                    <span>Chế độ chỉnh sửa</span>
                  </span>
                </div>

                <div>
                  <input
                    id="fullNameInput"
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-body-medium text-neutral-900"
                    placeholder="Nhập họ và tên"
                    autoFocus
                  />
                  {nameError ? (
                    <p className="text-body-xs text-danger-500 mt-1.5 flex items-center gap-1">
                      <Icon name="alert-circle" size={13} />
                      <span>{nameError}</span>
                    </p>
                  ) : (
                    <p className="text-body-xs text-neutral-500 mt-1.5">
                      Họ tên hiển thị trên các thẻ công việc (Card) và thông báo nhóm.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-body-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-whiteboard text-body-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Icon name="check" size={14} />
                    <span>{isSavingName ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-body-xs text-neutral-600 flex items-start gap-2.5 mt-3">
                  <div className="text-primary-600 shrink-0 mt-0.5">
                    <Icon name="shield" size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-800">Bảo mật thông tin nội bộ: </span>
                    <span>Mọi thay đổi về định danh tài khoản sẽ được ghi nhận vào nhật ký kiểm toán hệ thống tổ chức.</span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Row 2 & 3: Email công việc & Số điện thoại (View or Inline Edit) */}
          {!isEditingContact ? (
            <>
              {/* Row 2: Email */}
              <div className="py-4 flex items-center justify-between gap-4">
                <span className="w-36 sm:w-44 text-neutral-500 font-medium shrink-0">
                  Email công việc
                </span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-neutral-900">
                    {profile.email}
                  </span>
                  {profile.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-success-50 text-success-700 border border-success-200">
                      <Icon name="check-circle" size={12} />
                      <span>Đã xác thực</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailValue(profile.email)
                    setPhoneValue(profile.phone)
                    setContactError(null)
                    setIsEditingContact(true)
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer shrink-0 transition-colors"
                >
                  Sửa
                </button>
              </div>

              {/* Row 3: Số điện thoại */}
              <div className="py-4 flex items-center justify-between gap-4">
                <span className="w-36 sm:w-44 text-neutral-500 font-medium shrink-0">
                  Số điện thoại
                </span>
                <span className="flex-1 font-semibold text-neutral-900">
                  {profile.phone}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailValue(profile.email)
                    setPhoneValue(profile.phone)
                    setContactError(null)
                    setIsEditingContact(true)
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer shrink-0 transition-colors"
                >
                  Sửa
                </button>
              </div>
            </>
          ) : (
            /* Inline Edit Mode matching 'Sửa email và số điện thoại (Lỗi) - ScrumBan Flow.png' */
            <form onSubmit={handleSaveContact} className="py-4 space-y-4">
              <div className="p-5 rounded-xl border border-primary-200 bg-primary-50/20 space-y-4">
                <div className="flex items-center justify-between border-b border-primary-100 pb-3">
                  <div className="flex items-center gap-1.5 text-body-xs font-bold text-primary-700 tracking-wider uppercase">
                    <Icon name="mail" size={15} />
                    <span>CHỈNH SỬA THÔNG TIN LIÊN HỆ</span>
                  </div>
                  {contactError && (
                    <div className="flex items-center gap-1 text-body-xs font-semibold text-danger-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger-500" />
                      <span>Yêu cầu sửa lỗi</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between text-body-xs mb-1.5">
                    <label htmlFor="emailInput" className="font-semibold text-neutral-800">
                      Email công việc <span className="text-danger-500">*</span>
                    </label>
                    <span className="text-neutral-400">Bắt buộc xác thực nội bộ</span>
                  </div>
                  <div className="relative">
                    <input
                      id="emailInput"
                      type="text"
                      value={emailValue}
                      onChange={(e) => {
                        setEmailValue(e.target.value)
                        if (contactError) setContactError(null)
                      }}
                      className={`w-full px-3.5 py-2 rounded-lg border text-body-medium focus:outline-none transition-colors ${
                        contactError
                          ? 'border-danger-500 text-danger-900 bg-danger-50/20 focus:ring-2 focus:ring-danger-500/20'
                          : 'border-neutral-300 text-neutral-900 bg-whiteboard focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                      }`}
                      placeholder="name@company.com"
                    />
                    {contactError && (
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-danger-500">
                        <Icon name="alert-circle" size={18} />
                      </span>
                    )}
                  </div>
                  {contactError ? (
                    <p className="text-body-xs text-danger-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <span>⚠</span>
                      <span>{contactError}</span>
                    </p>
                  ) : (
                    <p className="text-body-xs text-neutral-400 mt-1.5">
                      Dùng làm địa chỉ nhận thông báo nhiệm vụ và khôi phục tài khoản.
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <div className="flex items-center justify-between text-body-xs mb-1.5">
                    <label htmlFor="phoneInput" className="font-semibold text-neutral-800">
                      Số điện thoại
                    </label>
                    <span className="text-neutral-400">Định dạng E.164</span>
                  </div>
                  <div className="relative">
                    <input
                      id="phoneInput"
                      type="text"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      className="w-full pl-3.5 pr-9 py-2 rounded-lg border border-neutral-300 text-body-medium text-neutral-900 bg-whiteboard focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="+84 912 345 678"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                      <Icon name="phone" size={16} />
                    </span>
                  </div>
                  <p className="text-body-xs text-neutral-500 mt-1.5 flex items-center gap-1">
                    <span>ⓘ</span>
                    <span>Dùng để nhận mã xác thực SMS khi bảo mật 2 lớp bật.</span>
                  </p>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-primary-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingContact(false)
                      setContactError(null)
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-body-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingContact}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-whiteboard text-body-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Icon name="check" size={14} />
                    <span>{isSavingContact ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom security callout */}
              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-body-xs text-neutral-600 flex items-start gap-2.5">
                <div className="text-neutral-500 shrink-0 mt-0.5">
                  <Icon name="shield" size={16} />
                </div>
                <div>
                  <p>
                    Mọi thay đổi với email công việc sẽ yêu cầu kích hoạt lại liên kết SSO và gửi thư xác thực về địa chỉ mới.
                  </p>
                  <a
                    href="#policy"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-1 text-primary-600 hover:underline font-semibold mt-1"
                  >
                    <span>Tìm hiểu chính sách bảo mật định danh</span>
                    <Icon name="external-link" size={12} />
                  </a>
                </div>
              </div>
            </form>
          )}

          {/* Row 4: Vai trò hệ thống */}
          <div className="py-4 flex items-center justify-between gap-4">
            <span className="w-36 sm:w-44 text-neutral-500 font-medium shrink-0">
              Vai trò hệ thống
            </span>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900">
                {profile.role}
              </div>
              <div className="text-body-xs text-neutral-400 mt-0.5">
                Liên hệ Quản trị viên (Admin) để yêu cầu thay đổi phân quyền
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200 shrink-0">
              Cố định
            </span>
          </div>

          {/* Row 5: Ngày tham gia */}
          <div className="py-4 flex items-center justify-between gap-4">
            <span className="w-36 sm:w-44 text-neutral-500 font-medium shrink-0">
              Ngày tham gia
            </span>
            <div className="flex-1 font-semibold text-neutral-900 flex items-center gap-2">
              <Icon name="calendar" size={15} className="text-neutral-400" />
              <span>{profile.joinDate}</span>
              <span className="text-neutral-400 font-normal">({profile.joinDuration})</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200 shrink-0">
              Chỉ đọc
            </span>
          </div>

          {/* Row 6: Múi giờ & Ngôn ngữ */}
          <div className="py-4">
            {!isEditingLocale ? (
              <div className="flex items-center justify-between gap-4">
                <span className="w-36 sm:w-44 text-neutral-500 font-medium shrink-0">
                  Múi giờ & Ngôn ngữ
                </span>
                <div className="flex-1 font-semibold text-neutral-900 flex items-center gap-2">
                  <Icon name="clock" size={15} className="text-neutral-400" />
                  <span>{selectedTimezone} • {selectedLanguage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingLocale(true)}
                  className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer shrink-0 transition-colors"
                >
                  Sửa
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-lg bg-paper-50 border border-neutral-200">
                <div className="font-semibold text-neutral-800 text-body-sm">
                  Cài đặt Múi giờ & Ngôn ngữ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-body-xs font-medium text-neutral-600 mb-1">
                      Múi giờ
                    </label>
                    <select
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-body-sm bg-whiteboard focus:outline-none focus:border-primary-500"
                    >
                      <option value="GMT+7 (Asia/Ho_Chi_Minh)">GMT+7 (Asia/Ho_Chi_Minh - Việt Nam)</option>
                      <option value="GMT+8 (Asia/Singapore)">GMT+8 (Asia/Singapore)</option>
                      <option value="GMT+9 (Asia/Tokyo)">GMT+9 (Asia/Tokyo)</option>
                      <option value="GMT+0 (UTC)">GMT+0 (UTC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-body-xs font-medium text-neutral-600 mb-1">
                      Ngôn ngữ hiển thị
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-body-sm bg-whiteboard focus:outline-none focus:border-primary-500"
                    >
                      <option value="Tiếng Việt">Tiếng Việt</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingLocale(false)}
                    className="px-3 py-1 rounded-md border border-neutral-300 text-body-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingLocale(false)}
                    className="px-3 py-1 rounded-md bg-primary-500 hover:bg-primary-600 text-whiteboard text-body-xs font-semibold"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Session Sync Block matching 'Đã cập nhật hồ sơ - ScrumBan Flow.png' ── */}
        <div className="p-5 rounded-xl bg-paper-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-body-medium font-bold text-neutral-900">
              Đồng bộ phiên đăng nhập
            </h4>
            <p className="text-body-xs text-neutral-500 mt-0.5">
              Cập nhật lần cuối vào {profile.lastSessionUpdate}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncSession}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard rounded-lg text-body-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50"
          >
            <Icon name="refresh" size={15} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Lưu phiên'}</span>
          </button>
        </div>

        {/* ── Footer Info ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-body-xs text-neutral-400 pt-2">
          <div className="flex items-center gap-1.5">
            <Icon name="shield" size={14} className="text-neutral-400" />
            <span>Dữ liệu hồ sơ được mã hóa và đồng bộ liên tục</span>
          </div>
          <div>
            Lần cập nhật cuối: {profile.lastProfileUpdate}
          </div>
        </div>
      </div>
    </div>
  )
}
