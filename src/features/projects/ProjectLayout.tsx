import { useEffect } from 'react'
import { Outlet, useParams, Navigate } from 'react-router-dom'
import { projectService } from './services/projectService'

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
  const numericId = parseInt(projectId ?? '', 10)

  useEffect(() => {
    if (!isNaN(numericId) && numericId > 0) {
      projectService.setActiveProjectId(numericId)
    }
  }, [numericId])

  // Guard: if projectId is missing or invalid, redirect to project list
  if (!projectId || isNaN(numericId) || numericId <= 0) {
    return <Navigate to="/projects" replace />
  }

  return <Outlet />
}
