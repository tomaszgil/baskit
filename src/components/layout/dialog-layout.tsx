import type { ReactNode } from 'react'
import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { ArrowLeft } from 'lucide-react'

interface DialogLayoutProps {
  title: ReactNode
  children: ReactNode
  headerActions?: ReactNode
  footerActions?: ReactNode
}

export function DialogLayout({
  title,
  children,
  headerActions,
  footerActions,
}: DialogLayoutProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2 max-w-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canGoBack}
              onClick={() => router.history.back()}
            >
              <ArrowLeft />
            </Button>
            <h1 className="text-lg leading-none font-semibold">{title}</h1>
          </div>
          {headerActions ? (
            <div className="flex items-center gap-2">{headerActions}</div>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="container mx-auto p-4 max-w-lg">{children}</div>
      </main>

      {/* Footer Navigation */}
      {footerActions ? (
        <footer className="w-full border-t bg-background">
          <div className="container mx-auto px-4 max-w-lg">{footerActions}</div>
        </footer>
      ) : null}
    </div>
  )
}
