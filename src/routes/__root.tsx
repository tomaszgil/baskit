import { Authenticated, Unauthenticated } from 'convex/react'
import { ThemeProvider } from '@/components/theme-provider'
import {
  createRootRoute,
  Navigate,
  Outlet,
  useLocation,
} from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
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
  const isLoginRoute = location.pathname === '/login'

  return (
    <ThemeProvider defaultTheme="dark">
      <Toaster />
      <Unauthenticated>
        {isLoginRoute ? <Outlet /> : <Navigate to="/login" replace />}
      </Unauthenticated>
      <Authenticated>
        {isCreateRoute || isEditRoute ? (
          <Outlet />
        ) : (
          <MainLayout>
            <Outlet />
          </MainLayout>
        )}
      </Authenticated>
    </ThemeProvider>
  )
}
