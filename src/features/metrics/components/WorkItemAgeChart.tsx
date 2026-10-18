import { Icon } from '@/components/ui'
import type { WorkItemAgeChartItem, WorkItemAgeTableItem } from '../types'

interface WorkItemAgeChartProps {
  chartData: WorkItemAgeChartItem[]
  tableData: WorkItemAgeTableItem[]
}

export function WorkItemAgeChart({ chartData, tableData }: WorkItemAgeChartProps) {
  const maxDays = 8.5
  const slaThreshold = 5.0

  return (
    <div className="space-y-6">
      {/* Legend & Capacity info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-neutral-300 dark:bg-neutral-600 inline-block" />
            <span>Cần làm (Backlog đã nạp)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" />
            <span>Đang thực hiện (In Progress)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-600 inline-block" />
            <span>Kiểm thử / Review (Testing)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-danger-600 inline-block" />
            <span className="text-danger-600 font-semibold">Ngưỡng rủi ro (&gt; 5.0 ngày)</span>
          </div>
        </div>

        <div className="font-semibold text-neutral-800 dark:text-neutral-200">
          WIP CAPACITY: 7 / 10
        </div>
      </div>

      {/* Info notice (S10-04) */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
        <Icon name="info" size={15} className="text-primary-600 shrink-0 mt-0.5" />
        <span>
          Biểu đồ hiển thị chính xác tổng thời gian các thẻ dở dang đã trôi qua kể từ khi bắt đầu.
          Thẻ càng dài tiến dần về phía phải càng có rủi ro cao trở thành nút thắt cổ chai
          (bottleneck).
        </span>
      </div>

      {/* Horizontal Stacked Bars Chart */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-4 relative overflow-x-auto">
        {/* SLA Reference Line Overlay */}
        <div
          className="absolute top-10 bottom-12 border-l-2 border-dashed border-danger-500 z-10 pointer-events-none"
          style={{
            left: `calc(190px + ${(slaThreshold / maxDays) * 100}% * 0.72)`,
          }}
        >
          <div className="absolute -top-7 -translate-x-1/2 bg-danger-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
            ▲ Ngưỡng rủi ro SLA: 5.0 ngày
          </div>
          <div className="absolute -bottom-6 -translate-x-1/2 text-danger-600 text-[10px] font-bold whitespace-nowrap">
            5 ngày
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 min-w-[620px]">
          {chartData.map((item) => {
            const backlogPct = (item.backlogDays / maxDays) * 100
            const inProgressPct = (item.inProgressDays / maxDays) * 100
            const reviewPct = (item.reviewDays / maxDays) * 100

            return (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                {/* Task Label on Left */}
                <div className="w-44 shrink-0 truncate">
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 mr-1.5">
                    {item.taskCode}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 truncate">
                    {item.taskTitle}
                  </span>
                </div>

                {/* Stacked Bar Track */}
                <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-md h-7 flex items-center p-0.5 overflow-hidden relative">
                  {item.backlogDays > 0 && (
                    <div
                      style={{ width: `${backlogPct}%` }}
                      className="h-full bg-neutral-300 dark:bg-neutral-600 rounded-l-sm"
                      title={`Backlog: ${item.backlogDays} ngày`}
                    />
                  )}
                  {item.inProgressDays > 0 && (
                    <div
                      style={{ width: `${inProgressPct}%` }}
                      className="h-full bg-teal-600"
                      title={`Đang làm: ${item.inProgressDays} ngày`}
                    />
                  )}
                  {item.reviewDays > 0 && (
                    <div
                      style={{ width: `${reviewPct}%` }}
                      className={`h-full ${item.isExceeded ? 'bg-danger-600' : 'bg-amber-600'} rounded-r-sm`}
                      title={`Review: ${item.reviewDays} ngày`}
                    />
                  )}

                  {/* Text Badge outside/inside bar */}
                  <span
                    className={`ml-2 text-xs font-bold whitespace-nowrap ${
                      item.isExceeded
                        ? 'text-danger-600'
                        : item.totalAgeDays > 4.0
                        ? 'text-amber-600'
                        : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {item.note}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* X Axis scale */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 pl-48 pr-12 min-w-[620px]">
          <span>0 ngày</span>
          <span>1 ngày</span>
          <span>2 ngày</span>
          <span>3 ngày</span>
          <span>4 ngày</span>
          <span className="text-danger-600 font-bold">5 ngày</span>
          <span>6 ngày</span>
          <span>7 ngày</span>
          <span>8 ngày</span>
        </div>
      </div>

      {/* Table of Highest Age Work Items (S10-04) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Danh sách thẻ dở dang có tuổi thọ cao nhất cần giải tỏa
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Thứ tự ưu tiên xử lý để giảm Cycle Time và tránh suy thoái chất lượng luồng giao vận.
            </p>
          </div>
          <span className="text-xs text-neutral-400 self-end sm:self-center">
            Sắp xếp theo: Work Item Age giảm dần
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="py-2.5 px-4 min-w-[280px]">Mã & Tiêu đề thẻ</th>
                <th className="py-2.5 px-4 w-40">Cột hiện tại</th>
                <th className="py-2.5 px-4 w-44">Người phụ trách</th>
                <th className="py-2.5 px-4 w-52">Tuổi thọ hiện tại (WIA)</th>
                <th className="py-2.5 px-4 w-36 text-right">Thao tác can thiệp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/60">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {row.priority === 'Critical' && (
                          <Icon name="alert-circle" size={15} className="text-danger-500" />
                        )}
                        {row.priority === 'High' && (
                          <Icon name="alert-triangle" size={15} className="text-amber-500" />
                        )}
                        {row.priority === 'Medium' && (
                          <Icon name="check-circle" size={15} className="text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            {row.taskCode}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              row.priority === 'Critical'
                                ? 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300'
                                : row.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {row.priority}
                          </span>
                        </div>
                        <div className="text-neutral-600 dark:text-neutral-300 text-[11px] mt-0.5 line-clamp-1">
                          {row.taskTitle}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {row.currentColumn}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold flex items-center justify-center">
                        {row.assigneeAvatar || 'US'}
                      </div>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {row.assigneeName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {row.ageDays} ngày
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          row.ageDays > 5.0
                            ? 'bg-danger-100 text-danger-800 dark:bg-danger-950 dark:text-danger-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {row.statusBadgeText}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {row.statusDetailText}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => alert(`Mở thẻ ${row.taskCode} trên Bảng Kanban`)}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 rounded-md transition-colors"
                      >
                        Mở thẻ
                      </button>
                      {row.interveneType === 'blockage' && (
                        <button
                          type="button"
                          onClick={() => alert(`Đã kích hoạt cờ Báo cản trở cho ${row.taskCode}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-danger-700 bg-danger-50 border border-danger-200 dark:bg-danger-950 dark:text-danger-300 hover:bg-danger-100 rounded-md transition-colors"
                        >
                          Báo cản trở
                        </button>
                      )}
                      {row.interveneType === 'urge' && (
                        <button
                          type="button"
                          onClick={() => alert(`Đã gửi thông báo hối thúc tới ${row.assigneeName}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 rounded-md transition-colors"
                        >
                          Hối thúc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Recommendation */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-xl flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="text-teal-600 font-bold">💡 Khuyến nghị quản lý:</span>
            <span>
              Điều chuyển 01 QA hỗ trợ kiểm thử #SB-148 để giải phóng WIP và đưa chu kỳ sprint về
              mức an toàn.
            </span>
          </div>
          <a
            href="/kanban"
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Xem toàn bộ 7 thẻ dở dang trên Bảng Kanban</span>
            <Icon name="arrow-right" size={13} />
          </a>
        </div>
      </div>
    </div>
  )
}
