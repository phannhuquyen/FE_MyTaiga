import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

/**
 * Root layout shell.
 * Composes responsive Sidebar, Topbar Header, and main viewport.
 */
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const isProfileRoute =
    location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings')

  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen((prev) => !prev)
    window.addEventListener('toggle-mobile-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper-100 font-sans text-neutral-800">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!isProfileRoute && (
          <Header
            onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
            onQuickCreate={() => {
              window.dispatchEvent(new CustomEvent('open-quick-create'))
            }}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
