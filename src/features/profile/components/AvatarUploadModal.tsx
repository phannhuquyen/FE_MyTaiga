import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { Icon } from '@/components/ui'

export interface AvatarUploadModalProps {
  isOpen: boolean
  currentAvatarUrl?: string
  currentInitials: string
  onClose: () => void
  onSave: (avatarUrl: string) => Promise<void>
}

// Sample fallback avatar presets if user doesn't upload a file
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
]

export function AvatarUploadModal({
  isOpen,
  currentAvatarUrl,
  currentInitials,
  onClose,
  onSave,
}: AvatarUploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFile = (file: File) => {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ tải lên tệp định dạng hình ảnh (JPG, PNG, WebP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dung lượng tệp vượt quá giới hạn 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleSave = async () => {
    if (!previewUrl) {
      onClose()
      return
    }
    try {
      setIsLoading(true)
      await onSave(previewUrl)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi cập nhật ảnh đại diện')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-modal-title"
        className="relative z-10 w-full max-w-lg bg-whiteboard rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h3
            id="avatar-modal-title"
            className="text-body-large font-bold text-neutral-900"
          >
            Thay đổi ảnh đại diện
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-body-sm flex items-center gap-2">
              <Icon name="alert-circle" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors bg-paper-50 hover:bg-paper-100 ${
              isDragging ? 'border-primary-500 bg-primary-50/30' : 'border-neutral-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-3">
              <Icon name="upload" size={24} />
            </div>

            <div className="text-body-medium font-semibold text-neutral-800">
              Kéo thả ảnh vào đây hoặc nhấp để tải lên
            </div>
            <div className="text-body-xs text-neutral-500 mt-1">
              Hỗ trợ JPG, PNG, WebP (Tối đa 5MB, khuyến nghị tỷ lệ 1:1)
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between text-body-xs text-neutral-500">
            <span>Hoặc chọn mẫu ảnh demo:</span>
            <div className="flex items-center gap-2">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="w-7 h-7 rounded-full overflow-hidden border border-neutral-300 hover:border-primary-500 transition-transform hover:scale-105 cursor-pointer"
                  title={`Ảnh mẫu ${idx + 1}`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Preview & Zoom Box */}
          <div>
            <div className="flex items-center justify-between text-label-uppercase text-neutral-400 font-semibold mb-3">
              <span>XEM TRƯỚC CẮT HÌNH TRÒN</span>
              <span>Tỉ lệ 1:1</span>
            </div>

            {/* Preview Box */}
            <div className="flex justify-center my-4">
              <div className="w-40 h-40 rounded-2xl border-2 border-primary-600 overflow-hidden flex items-center justify-center bg-neutral-100 shadow-inner relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Xem trước ảnh đại diện"
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 text-whiteboard flex items-center justify-center text-2xl font-bold">
                    {currentInitials}
                  </div>
                )}
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
                className="text-neutral-500 hover:text-neutral-800 p-1 cursor-pointer"
                aria-label="Thu nhỏ"
              >
                <Icon name="minus" size={16} />
              </button>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="flex-1 accent-primary-600 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.1).toFixed(1)))}
                className="text-neutral-500 hover:text-neutral-800 p-1 cursor-pointer"
                aria-label="Phóng to"
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
            <p className="text-center text-body-xs text-neutral-500 mt-2">
              Thu phóng để căn chỉnh vị trí khuôn mặt
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-paper-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-body-medium font-medium text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-whiteboard rounded-lg text-body-medium font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Icon name="check" size={16} />
            <span>{isLoading ? 'Đang lưu...' : 'Lưu ảnh đại diện'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
