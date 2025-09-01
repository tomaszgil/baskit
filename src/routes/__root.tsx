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
  const isEditRoute =
    location.pathname.startsWith('/templates/') ||
    location.pathname.startsWith('/lists/')

  return (
    <ThemeProvider defaultTheme="dark">
      {isCreateRoute || isEditRoute ? (
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
