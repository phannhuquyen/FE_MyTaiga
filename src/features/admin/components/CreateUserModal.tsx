import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui'
import type { AdminRole, CreateAdminUserPayload } from '../types'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (payload: CreateAdminUserPayload) => void
}

const DEPARTMENTS = [
  'Kỹ thuật phần mềm (Engineering)',
  'Thiết kế sản phẩm (Design)',
  'Quản lý dự án (PMO)',
  'Đảm bảo chất lượng (QA)',
  'Hạ tầng & Vận hành (DevOps)',
  'Phân tích nghiệp vụ (BA)',
  'Nhân sự (HR)',
  'Ban Quản trị (Core)',
]

export function CreateUserModal({ isOpen, onClose, onCreateUser }: CreateUserModalProps) {
  const [name, setName] = useState('Nguyễn Văn An')
  const [email, setEmail] = useState('vanan.dev@scrumban.io')
  const [role, setRole] = useState<AdminRole>('manager')
  const [department, setDepartment] = useState('Kỹ thuật phần mềm (Engineering)')
  const [activateImmediately, setActivateImmediately] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ')
      return
    }

    onCreateUser({
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      activateImmediately,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Thêm người dùng mới
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Khởi tạo tài khoản và chỉ định quyền hạn vận hành hệ thống
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Icon name="alert-circle" size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Địa chỉ Email công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@scrumban.io"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1.5">
              <Icon name="info" size={13} className="text-neutral-400 shrink-0" />
              <span>Mật khẩu khởi tạo ngẫu nhiên sẽ được gửi tự động đến email này.</span>
            </p>
          </div>

          {/* Role selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Vai trò hệ thống <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                Cần chỉ định
              </span>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="manager">Manager (Quản lý dự án / Scrum Master)</option>
              <option value="member">Member (Thành viên phát triển)</option>
              <option value="admin">Admin (Quản trị viên hệ thống)</option>
            </select>

            {/* Role description callout (S14-02) */}
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
              <Icon name="shield" size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                {role === 'manager' && (
                  <p>
                    <strong>Manager:</strong> Có toàn quyền tạo Sprint, quản lý Backlog, gắn thẻ và điều phối các cột Kanban, nhưng không thể can thiệp vào Cài đặt máy chủ hoặc Quản trị người dùng cấp hệ thống.
                  </p>
                )}
                {role === 'member' && (
                  <p>
                    <strong>Member:</strong> Tham gia thực thi công việc, cập nhật tiến độ subtask, kéo thả task trong giới hạn được phân công và báo cáo bug.
                  </p>
                )}
                {role === 'admin' && (
                  <p>
                    <strong>Admin:</strong> Toàn quyền quản trị hệ thống, cấp quyền tài khoản, phân bổ hạn ngạch lưu trữ và thiết lập ma trận bảo mật.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Department selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Phòng ban / Bộ phận
              </label>
              <span className="text-[10px] text-neutral-400">Tùy chọn</span>
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Immediate Activation Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                Kích hoạt tài khoản ngay khi tạo
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Người dùng có thể đăng nhập tức thì thông qua email kích hoạt
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={activateImmediately}
              onClick={() => setActivateImmediately((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                activateImmediately ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-whiteboard shadow ring-0 transition duration-200 ease-in-out ${
                  activateImmediately ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Icon name="shield" size={14} className="text-neutral-400 shrink-0" />
              <span>Chỉ Quản trị viên (Admin) mới có quyền cấp vai trò Admin.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-whiteboard flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Icon name="check" size={14} />
                <span>Lưu thông tin</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
