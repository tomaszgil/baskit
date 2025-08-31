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
    if (pathname === '/templates') return 'Szablony'
    return 'Baskit'
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'Strona główna' },
    { href: '/lists', icon: ShoppingCart, label: 'Listy' },
    { href: '/templates', icon: FileText, label: 'Szablony' },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-md">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-md">
        {children}
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-md">
          <nav className="flex items-center justify-around py-3">
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
