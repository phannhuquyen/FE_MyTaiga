/** Display the API's business message instead of Axios' transport status text. */
export function apiErrorMessage(error: unknown, fallback = 'Không thể thực hiện thao tác. Vui lòng thử lại.'): string {
  const response = (error as { response?: { status?: number; data?: { message?: unknown } } } | null)?.response
  const message = response?.data?.message
  if (typeof message === 'string' && message.trim()) return message
  if (response?.status === 409) return 'Dữ liệu đang xung đột. Vui lòng kiểm tra tên, thời gian và trạng thái hiện tại.'
  if (error instanceof Error && !/Request failed with status code/i.test(error.message)) return error.message
  return fallback
}
