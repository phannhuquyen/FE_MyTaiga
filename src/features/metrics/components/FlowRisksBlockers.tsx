import type { FlowRiskItem } from '../types'

interface FlowRisksBlockersProps {
  risks: FlowRiskItem[]
}

export function FlowRisksBlockers({ risks }: FlowRisksBlockersProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Kiểm soát rủi ro luồng (Flow Risks & Blockers)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-950 dark:text-danger-300">
              {risks.length} cảnh báo
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Các thẻ công việc cần quản lý can thiệp để bảo đảm nhịp độ luồng
          </p>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
        {risks.map((item) => (
          <div
            key={item.id}
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs first:pt-1 last:pb-1"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.level === 'critical'
                    ? 'bg-danger-500'
                    : item.level === 'warning'
                    ? 'bg-amber-600'
                    : 'bg-emerald-500'
                }`}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {item.taskCode}
                  </span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {item.taskTitle}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {item.blockageText}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <span
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  item.badgeColor === 'danger'
                    ? 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300'
                    : item.badgeColor === 'warning'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                }`}
              >
                {item.badgeText}
              </span>
              {item.level === 'critical' ? (
                <button
                  type="button"
                  onClick={() => alert(`Đã kích hoạt can thiệp gỡ nút thắt cho ${item.taskCode}`)}
                  className="px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-danger-400 hover:text-danger-600 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 shadow-2xs transition-colors"
                >
                  Gỡ nút thắt
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => alert(`Xem chi tiết thẻ ${item.taskCode}`)}
                  className="px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs transition-colors"
                >
                  Chi tiết
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
