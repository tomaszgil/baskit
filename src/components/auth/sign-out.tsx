import { useAuthActions } from '@convex-dev/auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '../ui/button'

export function SignOut() {
  const { signOut } = useAuthActions()

  return (
    <Button onClick={() => void signOut()} variant="outline" size="icon">
      <LogOut />
    </Button>
  )
}
