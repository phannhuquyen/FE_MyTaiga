import type { PaginatedData } from '@/services/api'

/** Read a paged API collection without treating its first page as the whole dataset. */
export async function allPages<T>(fetchPage: (page: number) => Promise<{ data: PaginatedData<T> }>): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page++) {
    const response = await fetchPage(page)
    const rows = response.data.items ?? []
    items.push(...rows)
    if (!rows.length || !Number.isFinite(response.data.total) || items.length >= response.data.total) return items
  }
}
