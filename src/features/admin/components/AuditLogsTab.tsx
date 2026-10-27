import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui'
import { api, type ActivityLogItem } from '@/services/api'

export function AuditLogsTab() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async (p = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.admin.activityLogs(p, pageSize)
      setLogs(res.data.items)
      setTotal(res.data.total)
      setPage(res.data.page)
    } catch (err) {
      console.error('Lỗi lấy nhật ký kiểm toán hệ thống:', err)
      setError('Không thể tải nhật ký kiểm toán. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Icon name="clock" size={20} className="text-emerald-500" />
            <span>Nhật ký Kiểm toán Hệ thống (Audit Logs)</span>
          </h2>
          <p className="text-body-sm text-neutral-400 mt-0.5">
            Ghi nhận toàn bộ thao tác nhạy cảm, thay đổi vai trò và cấu hình cấp hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLogs(page)}
          disabled={isLoading}
          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-body-sm font-semibold transition-colors flex items-center gap-2 self-start"
        >
          <Icon name="refresh" size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-danger-950/40 border border-danger-800/80 rounded-lg text-danger-300 text-body-sm flex items-center gap-2">
          <Icon name="alert-circle" size={18} className="text-danger-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Thời gian (UTC)</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng</th>
                <th className="py-3 px-4">Mô tả chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-body-sm text-neutral-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <Icon name="refresh" size={24} className="animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Đang tải nhật ký kiểm toán...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    Chưa có bản ghi nhật ký kiểm toán nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.activityLogId} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-neutral-400 font-mono">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-neutral-200">
                      User #{log.userId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-neutral-400">
                      {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                    </td>
                    <td className="py-3 px-4 text-neutral-300 leading-snug">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > pageSize && (
          <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-body-sm text-neutral-400 bg-neutral-950/40">
            <div>
              Hiển thị <span className="font-semibold text-neutral-200">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-semibold text-neutral-200">{Math.min(page * pageSize, total)}</span> trong{' '}
              <span className="font-semibold text-neutral-200">{total}</span> bản ghi
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 transition-colors"
              >
                Trước
              </button>
              <span className="text-xs">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
