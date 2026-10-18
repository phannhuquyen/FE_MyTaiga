import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { profileService } from './services/profileService'
import type { UserProfile } from './types'
import { SettingsSidebar } from './components/SettingsSidebar'
import { ProfileCard } from './components/ProfileCard'
import { AvatarUploadModal } from './components/AvatarUploadModal'
import { ProfileToast } from './components/ProfileToast'

export default function ProfilePage() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [toastState, setToastState] = useState<{
    isVisible: boolean
    message?: string
    description?: string
  }>({
    isVisible: false,
  })

  // Load profile from service
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await profileService.getProfile()
      setProfile(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Update Name
  const handleUpdateName = async (fullName: string) => {
    const updated = await profileService.updateName({ fullName })
    setProfile(updated)
    // Synchronize to global Auth state (sidebar & topbar)
    updateUser({
      name: updated.fullName,
      avatarCode: updated.avatarCode,
    })
    setToastState({
      isVisible: true,
      message: 'Đã cập nhật họ và tên thành công',
      description: 'Họ tên mới đã được đồng bộ trên toàn bộ hệ thống.',
    })
  }

  // Update Contact
  const handleUpdateContact = async (email: string, phone: string) => {
    const updated = await profileService.updateContact({ email, phone })
    setProfile(updated)
    updateUser({
      email: updated.email,
    })
    setToastState({
      isVisible: true,
      message: 'Đã cập nhật hồ sơ thành công',
      description: 'Các thay đổi đã được lưu và đồng bộ toàn hệ thống.',
    })
  }

  // Update Avatar
  const handleUpdateAvatar = async (avatarUrl: string) => {
    const updated = await profileService.updateAvatar({ avatarUrl })
    setProfile(updated)
    setToastState({
      isVisible: true,
      message: 'Đã cập nhật ảnh đại diện thành công',
      description: 'Ảnh đại diện mới đã được áp dụng toàn hệ thống.',
    })
  }

  // Sync Session
  const handleSyncSession = async () => {
    const result = await profileService.syncSession()
    if (profile) {
      setProfile({
        ...profile,
        lastSessionUpdate: result.lastSessionUpdate,
      })
    }
    setToastState({
      isVisible: true,
      message: 'Đã lưu và đồng bộ phiên đăng nhập',
      description: `Phiên làm việc đã được cập nhật lúc ${result.lastSessionUpdate}.`,
    })
  }

  if (isLoading || !profile) {
    return (
      <div className="flex h-full items-center justify-center bg-paper-100">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Icon name="refresh" size={24} className="animate-spin text-primary-600" />
          <span className="text-body-sm font-medium">Đang tải hồ sơ cá nhân...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-paper-100">
      {/* Settings Secondary Sidebar matching 'Hồ sơ cá nhân - ScrumBan Flow.png' */}
      <div className="hidden md:block">
        <SettingsSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-whiteboard border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))}
              className="lg:hidden p-1.5 -ml-1 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Icon name="menu" size={20} />
            </button>

            {/* Breadcrumb matching 'Hồ sơ cá nhân - ScrumBan Flow.png' */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-body-sm text-neutral-500 min-w-0"
            >
              <Link
                to="/profile"
                className="hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Tài khoản
              </Link>
              <span className="text-neutral-400">/</span>
              <span className="font-semibold text-neutral-900 truncate">
                Hồ sơ cá nhân
              </span>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 lg:w-60">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                <Icon name="search" size={15} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-8 pr-3 py-1 text-body-xs bg-paper-50 hover:bg-whiteboard focus:bg-whiteboard border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-neutral-800"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper-50 border border-neutral-200 text-body-xs font-medium text-neutral-700">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
              <span>Trực tuyến</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary-700 text-whiteboard flex items-center justify-center text-xs font-semibold">
              <Icon name="user" size={16} />
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ProfileCard
            profile={profile}
            onUpdateName={handleUpdateName}
            onUpdateContact={handleUpdateContact}
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
            onSyncSession={handleSyncSession}
          />
        </main>
      </div>

      {/* Avatar Upload / Crop Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        currentAvatarUrl={profile.avatarUrl}
        currentInitials={profile.avatarCode}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleUpdateAvatar}
      />

      {/* Success Toast Notification */}
      <ProfileToast
        isVisible={toastState.isVisible}
        message={toastState.message}
        description={toastState.description}
        onClose={() => setToastState((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
