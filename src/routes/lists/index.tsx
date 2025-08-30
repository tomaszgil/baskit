import { createFileRoute } from '@tanstack/react-router'
import { ShoppingList } from '@/components/shopping-list'

export const Route = createFileRoute('/lists/')({
  component: Lists,
})

function Lists() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Listy zakupów</h2>
        <p className="text-muted-foreground">
          Twórz i zarządzaj listami zakupów
        </p>
      </div>
      <ShoppingList />
    </div>
  )
}
