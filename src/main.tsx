import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { routeTree } from './routeTree.gen'
import './index.css'
import '@fontsource-variable/geist'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
      </ConvexAuthProvider>
    </StrictMode>,
  )
}
