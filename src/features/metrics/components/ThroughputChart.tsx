import { Icon } from '@/components/ui'

export function ThroughputChart() {
  const sprintData = [
    { name: 'Sprint 12 (Fintech Core)', cards: 14, sp: 28, efficiency: 72 },
    { name: 'Sprint 13 (Gateway Staging)', cards: 15, sp: 31, efficiency: 74 },
    { name: 'Sprint 14 (Tối ưu luồng - Hiện tại)', cards: 18, sp: 36, efficiency: 78, isCurrent: true },
  ]

  const maxCards = 22

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            TỔNG SẢN LƯỢNG BÀN GIAO
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
            18 <span className="text-xs font-normal text-neutral-500">thẻ / 14 ngày</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <Icon name="chevron-up" size={14} />
            +3 thẻ so với Sprint 13
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            FLOW EFFICIENCY (HIỆU SUẤT LUỒNG)
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            78.2%
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Thời gian chủ động thực hiện vs thời gian chờ
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            TỐC ĐỘ BÀN GIAO TRUNG BÌNH
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
            1.28 <span className="text-xs font-normal text-neutral-500">thẻ / ngày</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Duy trì ổn định trong 3 chu kỳ liên tiếp
          </div>
        </div>
      </div>

      {/* Historical Sprints Comparison Bar Chart */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            So sánh Throughput qua các chu kỳ Sprint gần nhất
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Số lượng thẻ đã di chuyển vào cột Hoàn thành (Done) trong mỗi chu kỳ 14 ngày
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {sprintData.map((sp) => {
            const barWidth = (sp.cards / maxCards) * 100
            return (
              <div key={sp.name} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    {sp.name}
                    {sp.isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded font-bold">
                        Đang diễn ra
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {sp.cards} thẻ ({sp.sp} Story Points)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-6 rounded-md overflow-hidden flex items-center p-0.5">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`h-full rounded-sm transition-all flex items-center justify-end px-2 text-[11px] font-bold text-white ${
                      sp.isCurrent ? 'bg-primary-600' : 'bg-neutral-400 dark:bg-neutral-600'
                    }`}
                  >
                    {sp.cards}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
