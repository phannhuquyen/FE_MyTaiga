import writeExcelFile, { type SheetData } from 'write-excel-file/browser'
import { toDateInputValue } from '@/lib/dates'
import type { FlowMetricsData } from '../types'

function reportSheet(sheet: string, headers: string[], widths: number[], rows: SheetData) {
  return {
    sheet,
    columns: widths.map(width => ({ width })),
    stickyRowsCount: 1,
    data: [headers.map(value => ({ value, fontWeight: 'bold' as const, backgroundColor: '#0D6C5E', textColor: '#FFFFFF', height: 22 })), ...rows],
  }
}

function reportDate(value: string) {
  const iso = toDateInputValue(value)
  return iso ? { value: new Date(`${iso}T00:00:00Z`), format: 'dd/mm/yyyy' } : value
}

export async function exportFlowMetrics(
  data: FlowMetricsData,
  scope: { projectId?: number; sprintId: string; sprintName: string },
) {
  const summary = reportSheet('Tổng quan', ['Thông tin', 'Giá trị', 'Đơn vị / Ghi chú'], [32, 50, 76], [
    ['Dự án', scope.projectId ?? null],
    ['Sprint', scope.sprintName],
    ['Khoảng Throughput', data.dateRangeLabel],
    ['Nguồn', 'Ảnh chụp dữ liệu Flow Metrics', { value: 'WIP lịch sử, ngưỡng và một số chỉ số có thể là dữ liệu minh họa. Bộ lọc Sprint xác định dữ liệu tải từ API.', wrap: true, height: 33 }],
    ['WIP hiện tại', data.wipCurrent, 'Việc'],
    ['Ngưỡng WIP', data.wipTargetMax, 'Việc'],
    ['Throughput', data.throughputCount, 'Việc hoàn thành'],
    ['Lịch sử Throughput', data.partialHistory ? 'Chưa phủ đầy đủ' : 'Theo dữ liệu máy chủ'],
    ['Bắt đầu ghi lịch sử', data.throughputHistoryStart ?? null],
    ['Baseline nhập', data.importedBaselineCount ?? null, 'Task'],
    ['Cycle Time trung bình', data.cycleTimeAvgDays, 'Ngày'],
    ['Tuổi việc trung bình', data.workItemAgeAvgDays, 'Ngày'],
    ['Tuổi việc cao nhất', data.workItemAgeMaxDays, 'Ngày'],
    ['Việc quá ngưỡng tuổi', data.workItemAgeWarningCount, 'Việc'],
  ])

  const wip = reportSheet('WIP', ['Mốc thời gian', 'WIP thực tế', 'Ngưỡng WIP', 'Nguồn'], [20, 18, 18, 35],
    data.wipRunData.map(point => [reportDate(point.date), point.actualWip, point.wipLimit, point.date === 'Hôm nay' ? 'Điểm hiện tại' : 'Lịch sử minh họa']))

  const cycle = reportSheet('Cycle Time', ['Mã Task', 'Tiêu đề', 'Ngày hoàn thành', 'Cycle Time (ngày)', 'Ghi chú'], [18, 56, 22, 23, 46],
    data.cycleTimeScatterData.map(point => [point.taskCode, { value: point.taskTitle, wrap: true }, reportDate(point.date), point.cycleTimeDays, point.outlierReason ?? null]))

  const age = reportSheet('Tuổi việc', ['Mã Task', 'Tiêu đề', 'Cột hiện tại', 'Người thực hiện', 'Tuổi việc (ngày)'], [18, 56, 22, 26, 22],
    data.workItemAgeTableData.map(item => [item.taskCode, { value: item.taskTitle, wrap: true }, item.currentColumn, item.assigneeName, item.ageDays]))

  const risks = reportSheet('Rủi ro', ['Mã Task', 'Tiêu đề', 'Cột hiện tại', 'Người thực hiện', 'Mức độ', 'Mô tả'], [18, 48, 22, 26, 22, 54],
    data.flowRisks.map(item => [item.taskCode, { value: item.taskTitle, wrap: true }, item.currentColumn, item.assigneeName, item.badgeText, { value: item.blockageText, wrap: true }]))

  const throughput = reportSheet('Throughput ngày', ['Ngày UTC', 'Task hoàn thành', 'Lịch sử đầy đủ'], [22, 24, 24],
    (data.throughputPoints ?? []).map(point => [point.date, point.doneTasks, point.historyComplete ? 'Có' : 'Chưa đầy đủ']))
  const sprintThroughput = reportSheet('Throughput Sprint', ['Sprint ID', 'Tên', 'Trạng thái', 'Bắt đầu', 'Kết thúc', 'Task hoàn thành'], [16, 40, 20, 24, 24, 24],
    (data.throughputSprints ?? []).map(item => [item.sprintId, item.sprintName, item.status, item.startDate, item.endDate, item.doneTasks]))
  const fileName = `flow-metrics-${scope.projectId ?? 'demo'}-${scope.sprintId === 'all' ? 'tat-ca-sprint' : scope.sprintId}.xlsx`
  await writeExcelFile([summary, wip, cycle, age, risks, throughput, sprintThroughput]).toFile(fileName)
}
