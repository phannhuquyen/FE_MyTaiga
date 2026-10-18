import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'

export default function ResetEmailSentPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || 'quannm@techcorp.vn'
  const [countdown, setCountdown] = useState(58)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleResend = () => {
    if (countdown > 0) return
    setResending(true)
    setTimeout(() => {
      setResending(false)
      setCountdown(60)
    }, 500)
  }

  return (
    <AuthLayout>
      <AuthCard className="text-center">
        {/* Top Mail Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto text-primary-600 mb-5 shadow-xs">
          <Icon name="mail" size={28} />
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-md font-bold text-neutral-900 tracking-tight">
          Kiểm tra hòm thư của bạn
        </h1>
        <p className="mt-2 text-body-sm text-neutral-500 leading-relaxed">
          Chúng tôi đã gửi email chứa hướng dẫn đặt lại mật khẩu đến địa chỉ:
        </p>

        {/* Email Pill Badge */}
        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-paper-100 border border-neutral-200 rounded-full text-body-sm font-semibold text-neutral-800">
          <span className="text-neutral-400">@</span>
          <span>{email}</span>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-paper-100 border border-neutral-200/80 rounded-lg text-left text-body-sm text-neutral-600 flex items-start gap-2.5">
          <Icon name="info" size={18} className="text-neutral-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Liên kết có hiệu lực trong <strong className="text-neutral-900 font-semibold">30 phút</strong>. Vui lòng kiểm tra cả thư mục <strong className="text-neutral-900 font-semibold">Spam</strong> hoặc <strong className="text-neutral-900 font-semibold">Quảng cáo</strong> nếu không thấy thư trong hộp thư chính.
          </div>
        </div>

        {/* Open Email Client Button (links to demo reset-password) */}
        <div className="mt-6">
          <Link
            to={`/reset-password?email=${encodeURIComponent(email)}`}
            className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Icon name="mail" size={16} />
            <span>Mở hộp thư điện tử (Thử nghiệm)</span>
          </Link>
        </div>

        {/* Resend Countdown */}
        <div className="mt-5 text-body-sm text-neutral-500 flex items-center justify-center gap-1.5">
          <Icon name="clock" size={14} className="text-neutral-400" />
          <span>Chưa nhận được thư?</span>
          {countdown > 0 ? (
            <span className="font-medium text-neutral-700">
              Gửi lại sau ({countdown}s)
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-primary-600 font-semibold hover:underline cursor-pointer ml-1"
            >
              {resending ? 'Đang gửi...' : 'Gửi lại ngay'}
            </button>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 pt-4 border-t border-neutral-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Icon name="arrow-left" size={16} />
            <span>Về trang đăng nhập</span>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
