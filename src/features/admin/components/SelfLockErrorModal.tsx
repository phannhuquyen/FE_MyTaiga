import { Icon } from '@/components/ui'

interface SelfLockErrorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SelfLockErrorModal({ isOpen, onClose }: SelfLockErrorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-rose-300 dark:border-rose-900/60 p-6 flex flex-col overflow-hidden relative"
        role="alertdialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
        >
          <Icon name="close" size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <Icon name="alert-triangle" size={24} />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Thao tác không được phép
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Bảo vệ quyền Admin
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Không thể khóa tài khoản của chính bạn <strong>(Nguyễn Quốc Bảo)</strong>. Để tránh gián đoạn quản trị hệ thống, hãy bàn giao đặc quyền Quản trị viên tối cao cho thành viên khác trước khi vô hiệu hóa tài khoản này.
            </p>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ủy quyền Quản trị viên</span>
                <Icon name="arrow-right" size={13} />
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline cursor-pointer"
              >
                Tìm hiểu chính sách bảo mật
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-neutral-800 text-whiteboard hover:bg-neutral-800 cursor-pointer shadow-xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}
