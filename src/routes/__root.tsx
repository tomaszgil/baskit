import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
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
  const isTopRoute =
    location.pathname === '/' ||
    location.pathname === '/lists' ||
    location.pathname === '/templates'
  const isLoginRoute = location.pathname === '/login'

  return (
    <ThemeProvider defaultTheme="dark">
      <Toaster />
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
      <Unauthenticated>
        {isLoginRoute ? <Outlet /> : <Navigate to="/login" replace />}
      </Unauthenticated>
      <Authenticated>
        {isLoginRoute ? <Navigate to="/" replace /> : null}
        {isTopRoute ? (
          <MainLayout>
            <Outlet />
          </MainLayout>
        ) : (
          <Outlet />
        )}
      </Authenticated>
    </ThemeProvider>
  )
}
