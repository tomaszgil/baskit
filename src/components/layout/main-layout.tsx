import type { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ShoppingCart, Home, TextSelect } from 'lucide-react'
import logo from '@/assets/logo.svg'
import { ModeToggle } from '../mode-toggle'
import { NavProfile } from '../auth/nav-profile'

interface AppLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: AppLayoutProps) {
  const location = useLocation()

  const getPageTitle = () => {
    const pathname = location.pathname
    if (pathname === '/')
      return (
        <span className="flex items-center gap-3">
          <img src={logo} alt="Baskit" className="h-8 w-8" /> Baskit
        </span>
      )
    if (pathname === '/lists') return 'Listy zakupów'
    if (pathname.startsWith('/lists/') && pathname.includes('/shop'))
      return 'Zakupy'
    if (pathname.startsWith('/lists/') && pathname.includes('/edit'))
      return 'Edytuj listę'
    if (pathname === '/templates') return 'Szablony'
    return 'Baskit'
  }

  const navigationItems = [
    {
      href: '/',
      isActive: (path: string) => path === '/',
      icon: Home,
      label: 'Strona główna',
    },
    {
      href: '/lists',
      isActive: (path: string) => path.startsWith('/lists'),
      icon: ShoppingCart,
      label: 'Listy',
    },
    {
      href: '/templates',
      isActive: (path: string) => path.startsWith('/templates'),
      icon: TextSelect,
      label: 'Szablony',
    },
  ]

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-lg">
          <h1 className="text-xl leading-none font-semibold">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <NavProfile />
          </div>
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
              const isActive = item.isActive(location.pathname)
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
