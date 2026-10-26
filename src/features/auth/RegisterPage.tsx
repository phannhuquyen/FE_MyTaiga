import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { AuthCard } from './components/AuthCard'
import { AuthLayout } from './components/AuthLayout'
import { api } from '@/services/api'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()

    // 1. Kiểm tra Client-side validation
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.')
      return
    }

    if (!trimmedEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email công việc.')
      return
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu từ 8 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.')
      return
    }

    // 2. Gọi API Backend thông qua file API tập trung
    setIsLoading(true)
    try {
      const res = await api.auth.register({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        confirmPassword,
      })

      if (res.success) {
        setIsSuccess(true)
        // Tự động chuyển hướng về trang đăng nhập sau 2 giây
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          status?: number
          data?: {
            message?: string
            errors?: Record<string, string[]>
          }
        }
        message?: string
      }

      const resData = errorObj.response?.data
      if (resData?.message) {
        setErrorMessage(resData.message)
      } else if (resData?.errors) {
        // Gom các lỗi validation từ ModelState của ASP.NET Core
        const firstErrorKey = Object.keys(resData.errors)[0]
        const firstErrorMsg = resData.errors[firstErrorKey]?.[0]
        setErrorMessage(firstErrorMsg || 'Thông tin đăng ký không hợp lệ.')
      } else {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.')
      }
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
          <span>Hệ thống ScrumBan</span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-headline-lg font-bold text-neutral-900 tracking-tight">
          Đăng ký tài khoản
        </h1>
        <p className="mt-1 text-body-default text-neutral-500">
          Tạo tài khoản để tham gia không gian làm việc ScrumBan Flow
        </p>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-body-sm text-emerald-800 animate-in fade-in">
            <Icon
              name="check-circle"
              size={18}
              className="text-emerald-600 shrink-0 mt-0.5"
            />
            <div className="leading-snug">
              <span className="font-semibold">Đăng ký thành công!</span> Đang chuyển hướng về trang đăng nhập...
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && !isSuccess && (
          <div className="mt-4 p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-2.5 text-body-sm text-danger-700 animate-in fade-in">
            <Icon
              name="alert-circle"
              size={18}
              className="text-danger-500 shrink-0 mt-0.5"
            />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="fullname-input"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Họ và tên <span className="text-danger-500">*</span>
            </label>
            <input
              id="fullname-input"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              placeholder="Nguyễn Văn A"
              disabled={isLoading || isSuccess}
              className="w-full px-3.5 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 transition-all focus:outline-none"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email-input"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Email công việc <span className="text-danger-500">*</span>
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              placeholder="name@company.com"
              disabled={isLoading || isSuccess}
              className="w-full px-3.5 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 transition-all focus:outline-none"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password-input"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Mật khẩu <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                placeholder="Tối thiểu 8 ký tự"
                disabled={isLoading || isSuccess}
                className="w-full pl-3.5 pr-10 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 transition-all focus:outline-none"
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

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm-password-input"
              className="block text-body-medium font-semibold text-neutral-800 mb-1.5"
            >
              Xác nhận mật khẩu <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                placeholder="Nhập lại mật khẩu"
                disabled={isLoading || isSuccess}
                className="w-full pl-3.5 pr-10 py-2 text-body-default bg-whiteboard rounded-md border border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 transition-all focus:outline-none"
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-whiteboard py-2.5 px-4 rounded font-medium text-body-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Icon name="refresh" size={16} className="animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký tài khoản</span>
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info: Link quay lại trang đăng nhập */}
        <div className="mt-8 pt-4 border-t border-neutral-100 text-center text-body-sm text-neutral-500">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-semibold underline cursor-pointer"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
