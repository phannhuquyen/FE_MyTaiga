import { useEffect, useState } from 'react'
import { api, type ProjectMemberData } from '@/services/api'
import { allPages } from '@/lib/allPages'

export function useProjectMembers(projectId?: number) {
  const [result, setResult] = useState<{ projectId: number; members: ProjectMemberData[] } | null>(null)
  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    allPages(page => api.projectMembers.list(projectId, { page, pageSize: 100 }))
      .then(members => { if (!cancelled) setResult({ projectId, members }) })
      .catch(() => { if (!cancelled) setResult({ projectId, members: [] }) })
    return () => { cancelled = true }
  }, [projectId])
  return result && result.projectId === projectId ? result.members : []
}
