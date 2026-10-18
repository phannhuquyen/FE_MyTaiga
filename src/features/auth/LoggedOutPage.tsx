import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'
import { useAuth } from './hooks/useAuth'

export default function LoggedOutPage() {
  const { lastLoggedOutUser } = useAuth()
  const displayEmail = lastLoggedOutUser?.email || 'quannm@techcorp.vn'
  const displayTime = lastLoggedOutUser?.timestamp || '17:30, Hôm nay'

  return (
    <AuthLayout>
      <AuthCard className="text-center">
        {/* Top Logout Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-paper-100 border border-neutral-200/80 flex items-center justify-center mx-auto text-neutral-700 mb-5 shadow-xs">
          <Icon name="log-out" size={28} />
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-md font-bold text-neutral-900 tracking-tight">
          Đã đăng xuất
        </h1>
        <p className="mt-2 text-body-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
          Phiên làm việc của bạn trên ScrumBan Flow đã kết thúc an toàn. Để tiếp tục làm việc, vui lòng đăng nhập lại.
        </p>

        {/* Session Summary Box */}
        <div className="mt-6 p-4 bg-paper-100 border border-neutral-200/80 rounded-lg text-left text-body-sm space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Tài khoản</span>
            <span className="font-semibold text-neutral-900">{displayEmail}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Thời gian</span>
            <span className="font-medium text-neutral-800">{displayTime}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-200/60">
            <span className="text-neutral-500">Trạng thái</span>
            <span className="flex items-center gap-1.5 font-medium text-primary-600">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              <span>Đã xóa token bảo mật</span>
            </span>
          </div>
        </div>

        {/* Re-login Button */}
        <div className="mt-6">
          <Link
            to="/login"
            className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Icon name="log-out" size={16} className="transform rotate-180" />
            <span>Đăng nhập lại</span>
          </Link>
        </div>

        {/* Home Link */}
        <div className="mt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-body-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span>Về trang chủ ScrumBan Flow</span>
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
