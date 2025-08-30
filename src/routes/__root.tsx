import { ThemeProvider } from '@/components/theme-provider'
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { AppLayout } from '@/components/app-layout'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const isCreateRoute =
    location.pathname === '/lists/create' ||
    location.pathname === '/templates/create'

  return (
    <ThemeProvider defaultTheme="dark">
      {isCreateRoute ? (
        <Outlet />
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
      <Toaster />
    </ThemeProvider>
  )
}
