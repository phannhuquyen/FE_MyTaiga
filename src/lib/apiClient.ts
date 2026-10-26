/**
 * src/lib/apiClient.ts
 * Re-export từ src/services/api.ts để đảm bảo tính nhất quán
 * và duy nhất một file quản lý API theo yêu cầu kiến trúc.
 */

export { API_ROOT, API_V1, httpClient as apiClient, api } from '@/services/api'
export { default } from '@/services/api'
