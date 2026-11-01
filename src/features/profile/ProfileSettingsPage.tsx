import { lazy, Suspense, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SettingsSidebar } from './components/SettingsSidebar'
import { ProfileToast } from './components/ProfileToast'
import { api } from '@/services/api'
import { apiErrorMessage } from '@/lib/apiErrors'
import { useAuth } from '@/features/auth/hooks/useAuth'

const Projects = lazy(() => import('@/features/projects/ProjectsListPage'))
const Notifications = lazy(() => import('@/features/notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })))

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (newPassword.length < 8) { setError('Mật khẩu mới cần ít nhất 8 ký tự.'); return }
    if (newPassword !== confirmPassword) { setError('Hai mật khẩu mới không khớp.'); return }
    setPending(true); setError(null)
    try {
      await api.auth.changePassword({ currentPassword, newPassword, confirmPassword })
      // The backend revokes all sessions after changing the password.
      await navigate('/logged-out')
      await logout()
    } catch (problem) { setError(apiErrorMessage(problem, 'Không thể đổi mật khẩu. Vui lòng thử lại.')) }
    finally { setPending(false) }
  }
  return <section className="max-w-xl bg-whiteboard border border-neutral-200 rounded-lg p-6 space-y-4">
    <h1 className="text-headline-sm font-semibold">Mật khẩu &amp; Bảo mật</h1>
    <p className="text-body-sm text-neutral-600">Đổi mật khẩu sẽ đăng xuất tất cả phiên đăng nhập. Bạn cần đăng nhập lại bằng mật khẩu mới.</p>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-body-sm">Mật khẩu hiện tại<input className="block w-full border border-neutral-300 rounded p-2 mt-1" type="password" autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label>
      <label className="block text-body-sm">Mật khẩu mới<input className="block w-full border border-neutral-300 rounded p-2 mt-1" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>
      <label className="block text-body-sm">Xác nhận mật khẩu mới<input className="block w-full border border-neutral-300 rounded p-2 mt-1" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>
      <button className="bg-primary-600 text-whiteboard rounded px-4 py-2 disabled:opacity-50" disabled={pending}>{pending ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
    </form>
    <ProfileToast isVisible={Boolean(error)} message="Không thể đổi mật khẩu" description={error || ''} variant="error" onClose={() => setError(null)} />
  </section>
}

export default function ProfileSettingsPage() {
  const section = useLocation().pathname.split('/').at(-1)
  const title = section === 'security' ? 'Mật khẩu & Bảo mật' : section === 'notifications' ? 'Thông báo cá nhân' : section === 'projects' ? 'Dự án tham gia' : section === 'integrations' ? 'Tích hợp' : 'Không tìm thấy trang cài đặt'
  return <div className="flex h-full w-full overflow-hidden bg-paper-100">
    <div className="hidden md:block"><SettingsSidebar /></div>
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      <nav aria-label="Điều hướng tài khoản" className="flex flex-wrap gap-3 text-body-sm text-primary-700">
        <Link to="/profile">Hồ sơ cá nhân</Link><Link to="/profile/security">Bảo mật</Link><Link to="/profile/notifications">Thông báo</Link><Link to="/profile/projects">Dự án</Link><Link to="/profile/integrations">Tích hợp</Link>
      </nav>
      <Suspense fallback={<p role="status">Đang tải {title}...</p>}>
        {section === 'security' ? <SecuritySettings /> : section === 'notifications' ? <><h1 className="text-headline-sm font-semibold">Thông báo cá nhân</h1><Notifications /></> : section === 'projects' ? <><h1 className="text-headline-sm font-semibold">Dự án tham gia</h1><Projects /></> : section === 'integrations' ? <section className="bg-whiteboard border border-neutral-200 rounded-lg p-6 space-y-3"><h1 className="text-headline-sm font-semibold">Tích hợp</h1><p>Backend chưa cung cấp API quản lý tích hợp cá nhân. Chưa thể kết nối hoặc lưu cấu hình tại đây.</p><button disabled className="border border-neutral-300 text-neutral-500 rounded px-4 py-2">Thêm tích hợp (chưa hỗ trợ)</button></section> : <h1>{title}</h1>}
      </Suspense>
    </div>
  </div>
}
