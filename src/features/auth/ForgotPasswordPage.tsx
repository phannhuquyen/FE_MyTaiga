import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'
import { authService } from './services/authService'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email công việc của bạn.')
      return
    }

    setIsLoading(true)
    try {
      await authService.requestPasswordReset({ email })
      navigate(`/reset-sent?email=${encodeURIComponent(email)}`)
    } catch {
      setError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
        >
          <Icon name="arrow-left" size={16} />
          <span>Quay lại đăng nhập</span>
        </Link>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-lg font-bold text-neutral-900 tracking-tight">
          Quên mật khẩu
        </h1>
        <p className="mt-2 text-body-default text-neutral-500 leading-relaxed">
          Nhập địa chỉ email liên kết với tài khoản dự án của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded text-body-sm text-danger-700 flex items-center gap-2">
            <Icon name="alert-circle" size={16} className="text-danger-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="forgot-email"
                className="block text-body-medium font-semibold text-neutral-800"
              >
                Email công việc
              </label>
              <span className="text-xs text-neutral-400">Bắt buộc</span>
            </div>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all text-neutral-800"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Icon name="refresh" size={16} className="animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : (
              <>
                <span>Gửi liên kết đặt lại</span>
                <Icon name="send" size={16} />
              </>
            )}
          </button>
        </form>

        {/* Help footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100 text-center text-body-sm text-neutral-500">
          Nếu bạn quên cả email đăng nhập, vui lòng liên hệ{' '}
          <span className="text-neutral-800 font-medium underline cursor-pointer hover:text-primary-600">
            Quản trị viên (Admin)
          </span>{' '}
          của dự án.
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
