import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui'
import type { ChatAttachment } from '../types'

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
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 8

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

  const handleDownload = () => {
    if (!attachment.url) return
    const link = document.createElement('a')
    link.href = attachment.url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = attachment.name
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
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
                Đăng bởi {attachment.uploadedBy || 'Hoàng Long'} lúc 10:45 • Bản sửa đổi lần 3
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
              <span className="text-neutral-300 mx-1">|</span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-1 hover:text-neutral-900 disabled:opacity-40 cursor-pointer"
                title="Trang trước"
              >
                ‹
              </button>
              <span className="font-mono text-neutral-500">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-1 hover:text-neutral-900 disabled:opacity-40 cursor-pointer"
                title="Trang sau"
              >
                ›
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

        {/* Document Content Viewport (S13-11) */}
        <div className="flex-1 overflow-auto bg-neutral-200/50 dark:bg-neutral-950 p-4 sm:p-8 flex justify-center">
          {attachment.type === 'image' ? (
            attachment.previewUrl || attachment.url ? (
              <img src={attachment.previewUrl || attachment.url} alt={attachment.name}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                className="max-w-full object-contain self-start" />
            ) : <p role="status">Chưa có liên kết xem trước ảnh. Vui lòng tải lại tin nhắn.</p>
          ) : (
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-3xl bg-whiteboard text-neutral-900 p-8 sm:p-10 rounded-xl shadow-lg border border-neutral-300 space-y-6 transition-transform duration-150"
          >
            {/* Document Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Icon name="check-circle" size={14} className="text-emerald-600" />
                  <span>SCRUMBAN CORE PLATFORM • PERFORMANCE BENCHMARK</span>
                </div>
                <h1 className="text-xl font-bold text-neutral-900">
                  K6 Load Test Benchmark SLA Report
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Mã kịch bản: <span className="font-mono font-semibold">STRESS_TEST_SP14_CONCURRENCY_5000</span>
                </p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Hoàn thành (Passed)
                </span>
                <p className="text-[11px] text-neutral-400 mt-1">Ngày thực thi: 24/10/2024</p>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Peak VUs</span>
                <div className="text-lg font-bold font-mono mt-0.5">5,000</div>
                <span className="text-[10px] text-emerald-600 font-semibold">→ 100% mục tiêu</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Độ trễ P95</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">164 ms</div>
                <span className="text-[10px] text-emerald-600 font-semibold">✓ SLA &lt; 200 ms</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Throughput</span>
                <div className="text-lg font-bold font-mono mt-0.5">3,420 rps</div>
                <span className="text-[10px] text-neutral-500">Tổng 2,052,000 req</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Tỷ lệ lỗi (Error Rate)</span>
                <div className="text-lg font-bold font-mono text-rose-600 mt-0.5">0.14 %</div>
                <span className="text-[10px] text-rose-600 font-semibold">⚠ 504 Gateway (Nginx)</span>
              </div>
            </div>

            {/* SVG Curve Chart */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Biểu đồ phân phối thời gian phản hồi (Response Time Duration)</span>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-emerald-700 inline-block" /> P95 (164ms)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-rose-700 inline-block border-dashed" /> Ngưỡng SLA (200ms)
                  </span>
                </div>
              </div>

              <div className="h-28 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* SLA line */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="430" y="25" fill="#b91c1c" fontSize="9" fontWeight="bold">SLA Limit: 200ms</text>
                  {/* Curve */}
                  <path
                    d="M 0,85 Q 150,80 250,55 T 450,40 L 500,38"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="2.5"
                  />
                  {/* Dot */}
                  <circle cx="430" cy="41" r="4" fill="#047857" />
                  <text x="415" y="55" fill="#047857" fontSize="9" fontWeight="bold">164ms</text>
                </svg>
              </div>
            </div>

            {/* Endpoint Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-700">
                Chi tiết kịch bản kiểm thử theo Endpoint
              </h4>
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b">
                    <tr>
                      <th className="py-2 px-3">HTTP Endpoint</th>
                      <th className="py-2 px-3">Số lượng Req</th>
                      <th className="py-2 px-3">Med (ms)</th>
                      <th className="py-2 px-3">P95 (ms)</th>
                      <th className="py-2 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-mono">
                    <tr>
                      <td className="py-2 px-3 text-emerald-800">POST /api/v1/auth/token</td>
                      <td className="py-2 px-3">412,040</td>
                      <td className="py-2 px-3">42</td>
                      <td className="py-2 px-3">88</td>
                      <td className="py-2 px-3 text-emerald-600 font-sans font-semibold">● Đạt SLA</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-emerald-800">GET /api/v1/backlog/items</td>
                      <td className="py-2 px-3">1,120,400</td>
                      <td className="py-2 px-3">78</td>
                      <td className="py-2 px-3">142</td>
                      <td className="py-2 px-3 text-emerald-600 font-sans font-semibold">● Đạt SLA</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-emerald-800">POST /api/v1/tasks/reorder</td>
                      <td className="py-2 px-3">519,560</td>
                      <td className="py-2 px-3">115</td>
                      <td className="py-2 px-3 text-rose-700 font-bold">224</td>
                      <td className="py-2 px-3 text-amber-600 font-sans font-semibold">● Cảnh báo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QA Conclusion */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold">ⓘ Kết luận từ QA Lead:</span>
              <p className="mt-1 text-neutral-700">
                Hệ thống duy trì trạng thái ổn định với 99.86% cuộc gọi thành công. 0.14% lỗi phát sinh hoàn toàn từ mã lỗi 504 khi ghi nhận đồng thời hơn 4,800 kết nối đồng thời trên một Ingress Pod. Đề nghị DevOps cấu hình tăng HPA (Horizontal Pod Autoscaler) và tối ưu keep-alive timeout.
              </p>
            </div>
          </div>
          )}
        </div>

        {/* Footer info (S13-11) */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Icon name="sliders" size={14} />
            <span>Nhấn phím Esc để đóng bản xem trước</span>
          </div>
          <div>
            <span>Xem bởi: Hoàng Long, Minh Quân, Trần Linh</span>
          </div>
        </div>
      </div>
    </div>
  )
}
