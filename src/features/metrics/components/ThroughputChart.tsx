import type { FlowMetricsData } from '../types'

export function ThroughputChart({ data }: { data: FlowMetricsData }) {
  const rows = data.throughputSprints ?? []
  const max = Math.max(1, ...rows.map(row => row.doneTasks))
  const days = data.throughputPoints?.length ?? 0
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['TỔNG SẢN LƯỢNG BÀN GIAO', `${data.throughputCount ?? '—'} thẻ`, data.dateRangeLabel],
          ['FLOW EFFICIENCY (HIỆU SUẤT LUỒNG)', '—', 'BE chưa cung cấp thời gian thực hiện và chờ'],
          ['TỐC ĐỘ BÀN GIAO TRUNG BÌNH', days ? `${((data.throughputCount ?? 0) / days).toFixed(2)} thẻ / ngày` : '—', `${days} ngày trong khoảng đã chọn (UTC)`],
        ].map(([label, value, note]) => (
          <div key={label} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{value}</div>
            <div className="text-xs text-neutral-500 mt-1">{note}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500">Bắt đầu ghi lịch sử: {data.throughputHistoryStart ? new Date(data.throughputHistoryStart).toLocaleString('vi-VN') : 'Chưa có mốc'} · Baseline nhập: {data.importedBaselineCount ?? '—'} Task</p>
      {data.partialHistory && <p role="status" className="text-sm text-warning-700">Lịch sử chưa phủ đầy đủ khoảng ngày; sản lượng có thể chưa đầy đủ.</p>}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs space-y-4">
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">So sánh Throughput qua các Sprint</h4>
        <p className="text-xs text-neutral-500">Số Task hoàn thành trong khoảng ngày đã chọn (UTC).</p>
        {!rows.length && <p className="text-sm text-neutral-500">Chưa có dữ liệu Sprint trong khoảng ngày này.</p>}
        {rows.map(row => (
          <div key={row.sprintId} className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-2"><span>{row.sprintName} · {row.status}</span><strong>{row.doneTasks} thẻ</strong></div>
            <div className="bg-neutral-100 dark:bg-neutral-900 h-6 rounded-md overflow-hidden">
              <div style={{ width: `${row.doneTasks / max * 100}%` }} className="h-full bg-primary-600 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-2xs overflow-x-auto">
        <h4 className="text-sm font-bold mb-3">Sản lượng theo ngày (UTC)</h4>
        <table className="w-full text-xs text-left">
          <thead><tr><th className="py-2">Ngày</th><th>Task hoàn thành</th><th>Lịch sử</th></tr></thead>
          <tbody>{(data.throughputPoints ?? []).map(point => <tr key={point.date} className="border-t border-neutral-100 dark:border-neutral-700"><td className="py-2">{point.date}</td><td>{point.doneTasks}</td><td>{point.historyComplete ? 'Đầy đủ' : 'Chưa đầy đủ'}</td></tr>)}</tbody>
        </table>
        {!days && <p className="text-xs text-neutral-500 py-3">Chưa có dữ liệu theo ngày.</p>}
      </div>
    </div>
  )
}
