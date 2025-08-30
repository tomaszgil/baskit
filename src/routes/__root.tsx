import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark">
      <ModeToggle />
      <Outlet />
    </ThemeProvider>
  ),
})
