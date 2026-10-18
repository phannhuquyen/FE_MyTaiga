import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Shared layout shell for all authentication screens.
 * Replicates the exact background, branding header and footer from Figma.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-paper-50 flex flex-col justify-between p-4 sm:p-6 font-sans antialiased text-neutral-800">
      {/* Top Branding Header */}
      <header className="pt-6 sm:pt-10 flex items-center justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group cursor-pointer"
          aria-label="Về trang chủ ScrumBan Flow"
        >
          {/* Green brand emblem square */}
          <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center text-whiteboard shrink-0 font-bold text-sm tracking-wider shadow-xs group-hover:bg-primary-600 transition-colors">
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-4 bg-whiteboard rounded-xs" />
              <span className="w-1.5 h-2.5 bg-whiteboard/70 rounded-xs" />
            </span>
          </div>
          <span className="text-headline-sm font-bold text-neutral-900 tracking-tight">
            ScrumBan Flow
          </span>
        </Link>
      </header>

      {/* Center Main Content Card Area */}
      <main className="my-auto py-8 flex items-center justify-center w-full">
        <div className="w-full max-w-[480px]">
          {children}
        </div>
      </main>

      {/* Bottom Legal & Language Footer */}
      <footer className="pb-4 sm:pb-6 text-label-meta text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto w-full px-4">
        <div className="flex items-center gap-2">
          <span>🌐 Tiếng Việt</span>
          <span className="text-neutral-300">•</span>
          <span className="hover:text-neutral-600 cursor-pointer transition-colors">English</span>
        </div>
        <div>
          <span>© 2025 ScrumBan Flow</span>
        </div>
      </footer>
    </div>
  )
}
