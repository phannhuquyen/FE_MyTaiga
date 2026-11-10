import { createContext, useContext } from 'react'
import type { ProjectData } from '@/services/api'

export const ProjectContext = createContext<ProjectData | null>(null)
export const useProjectContext = () => useContext(ProjectContext)
