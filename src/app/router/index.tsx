import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'

export const router = createBrowserRouter([
  // ── Authentication Routes (Standalone AuthLayout) ──
  {
    path: '/login',
    lazy: async () => {
      const Component = (await import('@/features/auth/LoginPage')).default
      return { Component }
    },
  },
  {
    path: '/forgot-password',
    lazy: async () => {
      const Component = (await import('@/features/auth/ForgotPasswordPage')).default
      return { Component }
    },
  },
  {
    path: '/reset-sent',
    lazy: async () => {
      const Component = (await import('@/features/auth/ResetEmailSentPage')).default
      return { Component }
    },
  },
  {
    path: '/reset-password',
    lazy: async () => {
      const Component = (await import('@/features/auth/ResetPasswordPage')).default
      return { Component }
    },
  },
  {
    path: '/logged-out',
    lazy: async () => {
      const Component = (await import('@/features/auth/LoggedOutPage')).default
      return { Component }
    },
  },
  {
    path: '/account-locked',
    lazy: async () => {
      const Component = (await import('@/features/auth/AccountLockedPage')).default
      return { Component }
    },
  },

  // ── Application Workspace Routes (AppLayout Shell) ──
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/projects" replace />,
      },
      {
        path: 'projects',
        lazy: async () => {
          const Component = (await import('@/features/projects/ProjectsListPage')).default
          return { Component }
        },
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'kanban',
        lazy: async () => {
          const Component = (await import('@/features/kanban/KanbanPage')).default
          return { Component }
        },
      },
      {
        path: 'backlog',
        lazy: async () => {
          const Component = (await import('@/features/backlog/BacklogPage')).default
          return { Component }
        },
      },
      {
        path: 'sprints',
        lazy: async () => {
          const Component = (await import('@/features/sprints/SprintsPage')).default
          return { Component }
        },
      },
      {
        path: 'epics',
        lazy: async () => {
          const Component = (await import('@/features/epics/EpicsPage')).default
          return { Component }
        },
      },
      {
        path: 'bugs',
        lazy: async () => {
          const Component = (await import('@/features/bugs/BugsPage')).default
          return { Component }
        },
      },
      {
        path: 'metrics',
        lazy: async () => {
          const Component = (await import('@/features/metrics/FlowMetricsPage')).default
          return { Component }
        },
      },
      {
        path: 'members',
        lazy: async () => {
          const Component = (await import('@/features/members/MembersPage')).default
          return { Component }
        },
      },
      {
        path: 'profile',
        lazy: async () => {
          const Component = (await import('@/features/profile/ProfilePage')).default
          return { Component }
        },
      },
      {
        path: 'settings/profile',
        element: <Navigate to="/profile" replace />,
      },
      {
        path: 'chat',
        lazy: async () => {
          const Component = (await import('@/features/chat/ChatPage')).default
          return { Component }
        },
      },
      {
        path: 'notifications',
        lazy: async () => {
          const Component = (await import('@/features/notifications/NotificationsPage')).default
          return { Component }
        },
      },
      {
        path: 'activity',
        lazy: async () => {
          const Component = (await import('@/features/notifications/components/ActivityTimelinePage')).default
          return { Component }
        },
      },
      {
        path: 'admin',
        lazy: async () => {
          const Component = (await import('@/features/admin/AdminPage')).default
          return { Component }
        },
      },
      {
        path: 'icons',
        lazy: async () => {
          const Component = (await import('@/features/dev/IconGalleryPage')).default
          return { Component }
        },
      },
      // Fallback
      {
        path: '*',
        element: <Navigate to="/projects" replace />,
      },
    ],
  },
])
