/**
 * Shared service types.
 * Define service contracts here so mock implementations
 * can later be swapped with real API calls.
 */

/** Standard paginated response shape */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Standard service error */
export interface ServiceError {
  code: string
  message: string
}
