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
          <CardTitle className="text-xl">Witaj w Baskit!</CardTitle>
          <CardDescription>Twórz listy zakupów szybko i łatwo</CardDescription>
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
        Klikając "Kontynuuj", zgadzasz się z naszymi{' '}
        <a href="#">Warunkami Usługi</a> i <a href="#">Polityką Prywatności</a>.
      </div>
    </div>
  )
}
