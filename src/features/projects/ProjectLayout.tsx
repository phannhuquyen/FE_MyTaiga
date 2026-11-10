import { useEffect, useState } from 'react'
import { Outlet, useParams, Navigate } from 'react-router-dom'
import { projectService } from './services/projectService'
import { api, type ProjectData } from '@/services/api'
import { ProjectContext } from './projectContext'

/**
 * ProjectLayout — Tier-2 wrapper for all project-scoped routes.
 *
 * Reads :projectId from the URL, validates it, writes it to localStorage
 * so that existing services (epicService, backlogService, etc.) that
 * call projectService.getActiveProjectId() continue to work without changes.
 *
 * Route: /projects/:projectId/*
 */
export default function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const numericId = /^\d+$/.test(projectId ?? '') ? Number(projectId) : NaN
  const validId = Number.isSafeInteger(numericId) && numericId > 0
  const [access, setAccess] = useState<{ id: number; project?: ProjectData; error?: string } | null>(null)

  useEffect(() => {
    if (!validId) return
    let cancelled = false
    api.projects.get(numericId).then((response) => {
      if (cancelled) return
      projectService.setActiveProjectId(numericId)
      setAccess({ id: numericId, project: response.data })
    }).catch(() => {
      if (!cancelled) setAccess({ id: numericId, error: 'Không thể truy cập dự án. Dự án không tồn tại, bạn không có quyền hoặc kết nối bị lỗi.' })
    })
    return () => { cancelled = true }
  }, [numericId, validId])

  // Guard: if projectId is missing or invalid, redirect to project list
  if (!validId) {
    return <Navigate to="/projects" replace />
  }

  if (access?.id !== numericId) return <div role="status">Đang xác minh quyền truy cập dự án...</div>
  if (access.error) return <div role="alert">{access.error}</div>
  return <ProjectContext.Provider value={access.project ?? null}><Outlet key={numericId} /></ProjectContext.Provider>
}
