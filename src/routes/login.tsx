import { LoginForm } from '@/components/auth/login-form'
import { createFileRoute } from '@tanstack/react-router'
import logo from '@/assets/logo.svg'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <img src={logo} alt="Baskit" className="size-6" />
          Baskit
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
