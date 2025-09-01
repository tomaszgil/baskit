import type { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ShoppingCart, FileText, Home } from 'lucide-react'
import { ModeToggle } from './mode-toggle'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()

  const getPageTitle = () => {
    const pathname = location.pathname
    if (pathname === '/') return 'Baskit'
    if (pathname === '/lists') return 'Listy zakupów'
    if (pathname === '/lists/current') return 'Zakupy'
    if (pathname === '/templates') return 'Szablony'
    return 'Baskit'
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'Strona główna' },
    { href: '/lists', icon: ShoppingCart, label: 'Listy' },
    { href: '/templates', icon: FileText, label: 'Szablony' },
  ]

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-lg">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="container mx-auto p-4 max-w-lg">{children}</div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full border-t bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          <nav className="grid grid-cols-3 gap-3 py-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </footer>
    </div>
  )
}
