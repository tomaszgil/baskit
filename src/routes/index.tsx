import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, FileText, Plus } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Baskit</h1>
        <p className="text-muted-foreground">
          Twórz listy zakupów szybko i łatwo
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Listy zakupów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Zarządzaj swoimi listami zakupów. Twórz nowe listy, edytuj
              istniejące i śledź postęp zakupów.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/lists">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Wszystkie listy
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/lists/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nowa lista
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Szablony
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Używaj gotowych szablonów do szybkiego tworzenia list zakupów.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/templates">
                <FileText className="h-4 w-4 mr-2" />
                Przeglądaj szablony
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
