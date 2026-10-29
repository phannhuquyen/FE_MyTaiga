import { useState } from 'react'
import { Icon } from '@/components/ui'
import { adminService } from '../services/adminService'
import type { SystemSettings } from '../types'

export function SystemSettingsTab() {
  const [settings, setSettings] = useState<SystemSettings>(() => adminService.getSettings())
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showAuditModal, setShowAuditModal] = useState(false)

  const handleChange = <K extends keyof SystemSettings>(field: K, value: SystemSettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setIsSaved(false)
    setSaveError(null)
    try {
      const result = await adminService.saveSettings(settings)
      if (!result.success) {
        setSaveError(result.error || 'Không thể lưu cấu hình hệ thống.')
        return
      }
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch {
      setSaveError('Không thể lưu cấu hình hệ thống. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    adminService.resetSettings()
    setSettings(adminService.getSettings())
    setIsSaved(false)
  }

  const storagePercentage = Math.round((settings.storageUsedGb / settings.storageTotalGb) * 100)

  return (
    <div className="space-y-6 pb-20">
      {/* Header (S14-07) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            Quản trị hệ thống / Quy chuẩn vận hành
          </p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Cấu hình Hệ thống
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Thiết lập các ngưỡng cảnh báo luồng công việc, dung lượng tệp và quy chuẩn vận hành chung.
          </p>
        </div>

        {/* Global Policy Badge */}
        <div className="p-3 px-4 rounded-xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4 text-xs shrink-0">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Chính sách áp dụng: {settings.policyScope}</span>
            </div>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              Sửa đổi gần nhất: {settings.lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Flow Thresholds */}
      <div className="bg-whiteboard dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-4 px-6 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-neutral-100">
            <Icon name="sliders" size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>Cảnh báo Tiến độ & Luồng công việc (Flow Thresholds)</span>
          </div>
          <span className="text-[11px] font-semibold text-neutral-500">
            Module ScrumBan Core
          </span>
        </div>

        <div className="p-6 divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {/* Due Soon Threshold */}
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Ngưỡng cảnh báo sắp hết hạn (Due soon)
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Khoảng thời gian trước hạn chót để hệ thống đổi thẻ sang màu cảnh báo vàng hổ phách trên bảng Kanban.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={168}
                value={settings.dueSoonHours}
                onChange={(e) => handleChange('dueSoonHours', Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-center font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">giờ</span>
            </div>
          </div>

          {/* Work Item Age Threshold */}
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Ngưỡng thẻ tồn đọng (Work Item Age threshold)
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Số ngày tối đa một thẻ được phép lưu lại ở cột Đang làm trước khi kích hoạt cảnh báo ùn tắc lưu lượng.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                step="0.5"
                min={1}
                max={30}
                value={settings.workAgeThresholdDays}
                onChange={(e) => handleChange('workAgeThresholdDays', Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-center font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Attachment Storage */}
      <div className="bg-whiteboard dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-4 px-6 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-neutral-100">
            <Icon name="paperclip" size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>Quản lý Tệp đính kèm & Lưu trữ (Attachment Storage)</span>
          </div>
          <span className="text-[11px] font-semibold text-neutral-500">
            Tài nguyên & Băng thông
          </span>
        </div>

        <div className="p-6 divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {/* Max File Size */}
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Dung lượng tệp tối đa (Max file size)
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Giới hạn kích thước cho mỗi tệp tải lên trong thẻ tác vụ, lỗi hoặc phòng ban.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={100}
                value={settings.maxFileSizeMb}
                onChange={(e) => handleChange('maxFileSizeMb', Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-center font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">MB</span>
            </div>
          </div>

          {/* Max Attachments Per Card */}
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Số lượng tệp tối đa trên mỗi thẻ (Max attachments per card)
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Tổng số tệp tài liệu và ảnh chụp màn hình được đính kèm trên một thẻ công việc.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={50}
                value={settings.maxAttachmentsPerCard}
                onChange={(e) => handleChange('maxAttachmentsPerCard', Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-center font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">tệp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Security & Session */}
      <div className="bg-whiteboard dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-4 px-6 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-neutral-100">
            <Icon name="shield" size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>Bảo mật & Phiên làm việc (Security & Session)</span>
          </div>
          <span className="text-[11px] font-semibold text-neutral-500">
            Xác thực người dùng
          </span>
        </div>

        <div className="p-6 divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {/* Session Timeout */}
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Thời gian hết hạn phiên đăng nhập (Session timeout)
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Tự động đăng xuất sau khoảng thời gian không có bất kỳ tương tác hoạt động nào từ tài khoản.
              </p>
            </div>
            <div className="shrink-0">
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="30 phút">30 phút</option>
                <option value="2 giờ">2 giờ</option>
                <option value="8 giờ làm việc">8 giờ làm việc</option>
                <option value="24 giờ">24 giờ</option>
              </select>
            </div>
          </div>

          {/* Max Failed Attempts */}
          <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Số lần đăng nhập sai tối đa trước khi khóa tài khoản
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Ngăn chặn tấn công dò mật khẩu (brute-force) bằng cách tạm khóa tài khoản trong 30 phút.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={3}
                max={10}
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-center font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">lần</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Bottom Summary Cards (S14-07) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Dung lượng đính kèm hiện tại
            </span>
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              title="Làm mới dung lượng"
            >
              <Icon name="refresh" size={14} />
            </button>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {settings.storageUsedGb} <span className="text-sm font-normal text-neutral-500">GB</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {storagePercentage}% / {settings.storageTotalGb} GB
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                style={{ width: `${storagePercentage}%` }}
                className="h-full bg-emerald-600 rounded-full"
              />
            </div>
          </div>
          <span className="text-[11px] text-neutral-400 block">
            Hạn mức máy chủ nội bộ (S3 Local Storage)
          </span>
        </div>

        {/* Work Item Aging Alert Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Cảnh báo tồn đọng đang kích hoạt
            </span>
            <Icon name="alert-triangle" size={16} className="text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {settings.agingCardsCount}
              </span>
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                thẻ vượt ngưỡng {settings.workAgeThresholdDays} ngày
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 flex items-center gap-1 font-medium">
              <span>• Cột Đang làm (In Progress) cần xử lý ùn ứ</span>
            </p>
          </div>
          <span className="text-[11px] text-neutral-400 block">
            Tự động đồng bộ từ Bảng Kanban & Flow Metrics
          </span>
        </div>

        {/* Audit Trail Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Nhật ký kiểm toán (Audit Trail)
            </span>
            <Icon name="check-circle" size={16} className="text-emerald-600" />
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Mọi thay đổi cấu hình được lưu vào bản ghi hệ thống không thể xóa bỏ để phục vụ đối soát ISO/IEC 27001.
          </p>
          <button
            type="button"
            onClick={() => setShowAuditModal(true)}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer self-start"
          >
            <span>Xem lịch sử thay đổi cấu hình</span>
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      </div>

      {/* Save Bar (S14-07) */}
      <div className="p-4 px-6 rounded-2xl bg-whiteboard dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
          <Icon name="check-circle" size={16} className="text-emerald-600 shrink-0" />
          <span>
            Thay đổi có hiệu lực ngay lập tức với toàn bộ thành viên trong phiên tới.
          </span>
          {saveError && <span role="alert" className="text-danger-600">{saveError}</span>}
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-2 animate-in fade-in">
              Đã lưu thành công!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            Khôi phục mặc định
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-whiteboard flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Icon name="check" size={14} />
            <span>Lưu cấu hình hệ thống</span>
          </button>
        </div>
      </div>

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Lịch sử kiểm toán Cấu hình Hệ thống
              </h3>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-neutral-500 text-[11px] mb-1">
                  <span>14/10/2024 - 15:42</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Nguyễn Quốc Bảo (Admin)</span>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200">
                  Cập nhật dung lượng tệp tối đa từ 15 MB lên 25 MB.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-neutral-500 text-[11px] mb-1">
                  <span>02/10/2024 - 09:10</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Trần Thanh Trúc (Admin)</span>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200">
                  Bật chính sách phiên đăng nhập 8 giờ làm việc và giới hạn 5 lần đăng nhập sai.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-neutral-900 dark:bg-neutral-800 text-whiteboard rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
