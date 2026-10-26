import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'
import { useAuth } from './hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, attemptsLeft, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const hasError = Boolean(error || localError)
  const displayErrorMessage =
    localError || error || `Email hoặc mật khẩu không đúng. Bạn còn ${attemptsLeft} lần thử.`

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (!email.trim()) {
      setLocalError('Vui lòng nhập email công việc của bạn.')
      return
    }
    if (!password) {
      setLocalError('Vui lòng nhập mật khẩu.')
      return
    }

    try {
      await login({ email, password, rememberMe })
      // On success, navigate to projects dashboard
      navigate('/projects')
    } catch (err: unknown) {
      const errorObj = err as { code?: string }
      if (errorObj.code === 'ACCOUNT_LOCKED') {
        navigate(`/account-locked?email=${encodeURIComponent(email)}`)
      }
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
          <span>Hệ thống ScrumBan</span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-lg font-bold text-neutral-900 tracking-tight">
          Đăng nhập
        </h1>
        <p className="mt-1 text-body-default text-neutral-500">
          Chào mừng bạn quay lại với ScrumBan Flow
        </p>

        {/* Error Banner matching Đăng nhập thất bại - ScrumBan Flow.png */}
        {hasError && (
          <div className="mt-4 p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-2.5 text-body-sm text-danger-700 animate-in fade-in">
            <Icon
              name="alert-circle"
              size={18}
              className="text-danger-500 shrink-0 mt-0.5"
            />
            <div className="leading-snug">{displayErrorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email-input"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Email công việc
            </label>
            <div className="relative">
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (hasError) {
                    clearError()
                    setLocalError(null)
                  }
                }}
                placeholder="name@company.com"
                className={`w-full px-3.5 py-2 text-body-default bg-whiteboard rounded-md border transition-all focus:outline-none ${
                  hasError
                    ? 'border-danger-500 text-neutral-900 focus:ring-1 focus:ring-danger-500 pr-10'
                    : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800'
                }`}
              />
              {hasError && (
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-danger-500 font-bold text-base">
                  !
                </span>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password-input"
                className="block text-body-medium font-semibold text-neutral-800"
              >
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (hasError) {
                    clearError()
                    setLocalError(null)
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-3.5 pr-10 py-2 text-body-default bg-whiteboard rounded-md border transition-all focus:outline-none ${
                  hasError
                    ? 'border-danger-500 text-neutral-900 focus:ring-1 focus:ring-danger-500'
                    : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800'
                }`}
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="text-body-sm text-neutral-600 select-none cursor-pointer"
            >
              Duy trì đăng nhập trên thiết bị này
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Icon name="refresh" size={16} className="animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-neutral-100 text-center text-body-sm text-neutral-500">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 font-semibold underline cursor-pointer"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
