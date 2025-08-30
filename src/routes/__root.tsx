import { ThemeProvider } from '@/components/theme-provider'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AppLayout } from '@/components/app-layout'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark">
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ThemeProvider>
  ),
})
