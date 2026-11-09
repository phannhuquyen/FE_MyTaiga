export const dateOrderError = 'Ngày kết thúc không được trước ngày bắt đầu.'

/** Convert dates displayed by feature adapters to the native date input format. */
export function toDateInputValue(value: string): string {
  const displayDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value)
  const iso = displayDate
    ? `${displayDate[3]}-${displayDate[2].padStart(2, '0')}-${displayDate[1].padStart(2, '0')}`
    : value
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso.startsWith('0000')) return ''
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : ''
}
