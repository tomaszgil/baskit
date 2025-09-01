import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { ArrowLeft } from 'lucide-react'

interface DialogLayoutProps {
  title: ReactNode
  children: ReactNode
  actions: ReactNode
}

export function DialogLayout({ title, children, actions }: DialogLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2 max-w-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '..' })}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="container mx-auto p-4 max-w-lg">{children}</div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full border-t bg-background">
        <div className="container mx-auto px-4 max-w-lg">{actions}</div>
      </footer>
    </div>
  )
}
