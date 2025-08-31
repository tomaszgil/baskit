import { createFileRoute } from '@tanstack/react-router'
import { ShoppingList } from '@/components/shopping-list'

export const Route = createFileRoute('/lists/')({
  component: Lists,
})

function Lists() {
  return (
    <div className="space-y-4">
      <ShoppingList />
    </div>
  )
}
