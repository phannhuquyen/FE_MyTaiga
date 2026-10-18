import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'
import { authService } from './services/authService'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validation criteria
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isAllValid = hasMinLength && hasUppercase && hasLowercase && hasNumber

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isAllValid) {
      setError('Mật khẩu chưa đáp ứng đủ các tiêu chuẩn bảo mật.')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPassword({ password, confirmPassword })
      // Navigate to login on success
      navigate('/login')
    } catch {
      setError('Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
          <span>BẢO MẬT TÀI KHOẢN</span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-lg font-bold text-neutral-900 tracking-tight">
          Đặt lại mật khẩu mới
        </h1>
        <p className="mt-1 text-body-default text-neutral-500">
          Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded text-body-sm text-danger-700 flex items-center gap-2">
            <Icon name="alert-circle" size={16} className="text-danger-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full pl-3.5 pr-10 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all text-neutral-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          {/* Password Criteria Checklist Box */}
          <div className="p-3.5 bg-paper-100 border border-neutral-200/80 rounded-md text-xs space-y-1.5 text-neutral-600">
            <div className="font-semibold text-neutral-800 mb-1">
              Tiêu chuẩn mật khẩu:
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  hasMinLength ? 'bg-success-500' : 'bg-neutral-300'
                }`}
              />
              <span className={hasMinLength ? 'text-neutral-900 font-medium' : ''}>
                Tối thiểu 8 ký tự
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  hasUppercase ? 'bg-success-500' : 'bg-neutral-300'
                }`}
              />
              <span className={hasUppercase ? 'text-neutral-900 font-medium' : ''}>
                Chứa ít nhất một chữ hoa (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  hasLowercase ? 'bg-success-500' : 'bg-neutral-300'
                }`}
              />
              <span className={hasLowercase ? 'text-neutral-900 font-medium' : ''}>
                Chứa ít nhất một chữ thường (a-z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  hasNumber ? 'bg-success-500' : 'bg-neutral-300'
                }`}
              />
              <span className={hasNumber ? 'text-neutral-900 font-medium' : ''}>
                Chứa ít nhất một chữ số (0-9)
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-3.5 pr-10 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all text-neutral-800"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !isAllValid}
              className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Icon name="refresh" size={16} className="animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <span>Cập nhật mật khẩu</span>
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <Icon name="arrow-left" size={16} />
            <span>Hủy và về trang đăng nhập</span>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
