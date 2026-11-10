import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Icon } from '@/components/ui'
import type { ChatAttachment } from '../types'
import { refreshChatAttachment } from '../services/attachmentService'

interface AttachmentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  attachment?: ChatAttachment | null
}

export function AttachmentPreviewModal({
  isOpen,
  onClose,
  attachment,
}: AttachmentPreviewModalProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [zoom, setZoom] = useState(100)

  const [media, setMedia] = useState<{ source: ChatAttachment; fresh?: ChatAttachment; error?: string } | null>(null)
  const [documentPreview, setDocumentPreview] = useState<{ source: ChatAttachment; url?: string; text?: string; error?: string } | null>(null)
  useEffect(() => {
    if (!isOpen || !attachment || attachment.type === 'image') return
    let cancelled = false
    let objectUrl: string | undefined
    const supported = /\.(pdf|txt)$/i.test(attachment.name)
    if (!supported || !/^[1-9]\d*$/.test(attachment.id)) return
    api.chat.previewAttachmentBlob(Number(attachment.id)).then(async blob => {
      if (/\.pdf$/i.test(attachment.name)) {
        objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        if (cancelled) URL.revokeObjectURL(objectUrl)
        else setDocumentPreview({ source: attachment, url: objectUrl })
      } else {
        const content = await blob.text()
        if (!cancelled) setDocumentPreview({ source: attachment, text: content })
      }
    }).catch(() => { if (!cancelled) setDocumentPreview({ source: attachment, error: 'Không thể tải nội dung xem trước. Bạn có thể thử tải xuống.' }) })
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [isOpen, attachment])
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!isOpen || !attachment) return
    let cancelled = false
    const refresh = () => {
      refreshChatAttachment(attachment).then(fresh => {
        if (!cancelled) setMedia({ source: attachment, fresh })
      }).catch(() => {
        if (!cancelled) setMedia({ source: attachment, error: 'Không thể tải ảnh. Vui lòng mở lại bản xem trước.' })
      })
    }
    refresh()
    const timer = window.setInterval(refresh, 9 * 60_000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [isOpen, attachment])
  const fresh = attachment && (!attachment.roomId || !attachment.messageId)
    ? attachment
    : media?.source === attachment ? media?.fresh : undefined
  const imageUrl = fresh?.previewUrl || fresh?.url

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !attachment) return null

  const handleDownload = async () => {
    if (!fresh?.url || isDownloading) return
    setDownloadError(null)
    setIsDownloading(true)
    let objectUrl: string | undefined
    try {
      const needsAuth = !/^https?:\/\//i.test(fresh.url) && /^[1-9]\d*$/.test(attachment.id)
      const href = needsAuth ? (objectUrl = URL.createObjectURL(await api.chat.downloadAttachmentBlob(Number(attachment.id)))) : fresh.url
      const link = document.createElement('a')
      link.href = href
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = attachment.name
      link.click()
    } catch {
      setDownloadError('Không thể tải tệp. Vui lòng thử lại.')
    } finally {
      if (objectUrl) { const url = objectUrl; window.setTimeout(() => URL.revokeObjectURL(url), 1000) }
      setIsDownloading(false)
    }
  }

  return (
    <div onClick={(event) => { if (event.target === event.currentTarget) onClose() }} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[92vh] bg-whiteboard dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700/50 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top bar (S13-11) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 shrink-0">
          {/* File info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0 border border-rose-200">
              <Icon name="file-text" size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {attachment.name}
                </h3>
                <span className="text-[11px] text-neutral-400 shrink-0">
                  ({attachment.size})
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate">
                Đăng bởi {attachment.uploadedBy || 'Chưa có thông tin'} · {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleString('vi-VN') : 'Chưa có thời gian tải lên'}
              </p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            {/* Zoom & Page controls */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-whiteboard dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="px-1 hover:text-neutral-900 cursor-pointer"
                title="Thu nhỏ"
              >
                -
              </button>
              <span className="w-12 text-center font-mono">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
                className="px-1 hover:text-neutral-900 cursor-pointer"
                title="Phóng to"
              >
                +
              </button>
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-whiteboard dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Icon name="copy" size={14} />
              <span>In</span>
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!fresh?.url || isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-whiteboard text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Icon name="download" size={14} />
              <span>Tải xuống</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {downloadError && <p role="alert" className="px-5 py-2 text-danger-700 text-xs">{downloadError}</p>}
        {/* Document Content Viewport (S13-11) */}
        <div className="flex-1 overflow-auto bg-neutral-200/50 dark:bg-neutral-950 p-4 sm:p-8 flex justify-center">
          {attachment.type === 'image' ? (
            imageUrl && failedImageUrl !== imageUrl ? (
              <img src={imageUrl} alt={attachment.name} onError={() => setFailedImageUrl(imageUrl)}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className="max-w-full object-contain self-start" />
            ) : <p role="status">{media?.source === attachment && media.error ? media.error : imageUrl ? 'Không tải được ảnh. Vui lòng mở lại bản xem trước.' : 'Đang lấy liên kết xem trước ảnh...'}</p>
          ) : documentPreview?.source === attachment && documentPreview.error ? <p role="alert">{documentPreview.error}</p>
            : documentPreview?.source === attachment && documentPreview.url ? <iframe title={attachment.name} src={documentPreview.url} className="w-full h-full min-h-80 bg-whiteboard" />
            : documentPreview?.source === attachment && documentPreview.text !== undefined ? <pre className="whitespace-pre-wrap break-all text-sm bg-whiteboard text-neutral-900 p-6 w-full">{documentPreview.text}</pre>
            : /\.(pdf|txt)$/i.test(attachment.name) && /^[1-9]\d*$/.test(attachment.id) ? <p role="status">Đang tải nội dung tệp...</p>
            : <p>Định dạng này chưa hỗ trợ xem trước. Hãy tải tệp để xem.</p>
          }
        </div>

        {/* Footer info (S13-11) */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Icon name="sliders" size={14} />
            <span>Nhấn phím Esc để đóng bản xem trước</span>
          </div>
          <div>
            <span>Chưa có dữ liệu lượt xem</span>
          </div>
        </div>
      </div>
    </div>
  )
}
