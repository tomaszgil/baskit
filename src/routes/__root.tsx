import { Authenticated, Unauthenticated } from 'convex/react'
import { ThemeProvider } from '@/components/theme-provider'
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Toaster } from '@/components/ui/sonner'
import { SignInWithGoogle } from '@/components/auth/SignInWithGoogle'

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
      <Unauthenticated>
        <SignInWithGoogle />
      </Unauthenticated>
      <Authenticated>
        {isCreateRoute || isEditRoute ? (
          <Outlet />
        ) : (
          <MainLayout>
            <Outlet />
          </MainLayout>
        )}
        <Toaster />
      </Authenticated>
    </ThemeProvider>
  )
}
