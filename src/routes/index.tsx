import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShoppingCart, SquareDashedKanban, Plus } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart />
              Listy zakupów
            </CardTitle>
            <CardDescription>
              Zarządzaj swoimi listami zakupów. Twórz nowe listy, edytuj
              istniejące i śledź postęp zakupów.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/lists">
                  <ShoppingCart />
                  Wszystkie listy
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/lists/create">
                  <Plus />
                  Nowa lista
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SquareDashedKanban />
              Szablony
            </CardTitle>
            <CardDescription>
              Używaj gotowych szablonów do szybkiego tworzenia list zakupów.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/templates">Przeglądaj szablony</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
