import type { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ShoppingCart, FileText, Home, ShoppingBag } from 'lucide-react'
import logo from '@/assets/logo.svg'
import { ModeToggle } from '../mode-toggle'
import { useShoppingStore } from '../shopping-store'
import { SignOut } from '../auth/SignOut'

interface AppLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const { currentListId } = useShoppingStore()

  const getPageTitle = () => {
    const pathname = location.pathname
    if (pathname === '/')
      return (
        <span className="flex items-center gap-3">
          <img src={logo} alt="Baskit" className="h-8 w-8" /> Baskit
        </span>
      )
    if (pathname === '/lists') return 'Listy zakupów'
    if (pathname === '/shopping') return 'Zakupy'
    if (pathname === '/templates') return 'Szablony'
    return 'Baskit'
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'Strona główna' },
    { href: '/shopping', icon: ShoppingBag, label: 'Zakupy' },
    { href: '/lists', icon: ShoppingCart, label: 'Listy' },
    { href: '/templates', icon: FileText, label: 'Szablony' },
  ]

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-lg">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <SignOut />
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
          <nav className="grid grid-cols-4 gap-3 py-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              const isShoppingActive =
                item.href === '/shopping' && currentListId
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
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {isShoppingActive && (
                      <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                      </span>
                    )}
                  </div>
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
