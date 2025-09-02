import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SignInWithGoogle } from './sign-in'

export function LoginForm() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to Baskit!</CardTitle>
          <CardDescription>
            Create shopping lists quickly and easily
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col ">
              <SignInWithGoogle />
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
