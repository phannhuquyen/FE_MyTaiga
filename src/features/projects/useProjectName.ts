import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useProjectContext } from './projectContext'

export function useProjectName(projectId?: number | null) {
  const project = useProjectContext()
  const [loaded, setLoaded] = useState<{ id: number; name: string } | null>(null)
  useEffect(() => {
    if (!projectId || project?.projectId === projectId) return
    let cancelled = false
    api.projects.get(projectId).then(response => {
      if (!cancelled) setLoaded({ id: projectId, name: response.data.projectName })
    }).catch(() => { if (!cancelled) setLoaded(null) })
    return () => { cancelled = true }
  }, [projectId, project?.projectId])
  return project && project.projectId === projectId ? project.projectName
    : loaded?.id === projectId ? loaded?.name : projectId ? `Dự án #${projectId}` : 'Dự án'
}
