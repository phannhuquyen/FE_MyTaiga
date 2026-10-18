import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'

export default function AccountLockedPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || 'quannm@techcorp.vn'
  const [supportRequested, setSupportRequested] = useState(false)

  const handleSupportRequest = () => {
    setSupportRequested(true)
  }

  return (
    <AuthLayout>
      <AuthCard className="text-center">
        {/* Top Locked Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-danger-100 border border-danger-200/60 flex items-center justify-center mx-auto text-danger-500 mb-5 shadow-xs relative">
          <Icon name="lock" size={26} />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-danger-500 text-whiteboard flex items-center justify-center shadow-xs">
            <Icon name="clock" size={12} />
          </span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-md font-bold text-neutral-900 tracking-tight">
          Tài khoản tạm thời bị khóa
        </h1>
        <p className="mt-2 text-body-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
          Tài khoản đã bị khóa do nhập sai mật khẩu quá 5 lần liên tiếp. Vui lòng liên hệ quản trị viên để mở khóa hoặc đặt lại quyền truy cập.
        </p>

        {/* Incident Details Box */}
        <div className="mt-6 p-4 bg-paper-100 border border-neutral-200/80 rounded-lg text-left text-body-sm space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Email tài khoản</span>
            <span className="font-semibold text-neutral-900">{email}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Thời gian ghi nhận</span>
            <span className="font-medium text-neutral-800">10:42, Hôm nay</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-200/60">
            <span className="text-neutral-500">Mã tra cứu sự cố</span>
            <span className="font-mono font-semibold text-neutral-800 bg-neutral-200/60 px-1.5 py-0.5 rounded text-[11px]">
              ERR-AUTH-403
            </span>
          </div>
        </div>

        {/* Support CTA Button */}
        <div className="mt-6">
          {supportRequested ? (
            <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-xs font-semibold text-success-700 flex items-center justify-center gap-2">
              <Icon name="check-circle" size={16} className="text-success-500" />
              <span>Yêu cầu hỗ trợ đã được gửi tới Quản trị viên!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSupportRequest}
              className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Icon name="help-circle" size={18} />
              <span>Gửi yêu cầu hỗ trợ</span>
            </button>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <Icon name="arrow-left" size={16} />
            <span>Quay lại màn hình Đăng nhập</span>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
