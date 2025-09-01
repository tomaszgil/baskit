import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useShopping } from '@/components/shopping-provider'
import { ArrowLeft, Square } from 'lucide-react'

export const Route = createFileRoute('/lists/current')({
  component: CurrentShoppingList,
})

function getUnitLabel(unit: string) {
  switch (unit) {
    case 'ml':
      return 'ml'
    case 'g':
      return 'g'
    case 'piece':
      return 'szt.'
    default:
      return unit
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft':
      return 'Szkic'
    case 'ready':
      return 'Gotowa'
    case 'completed':
      return 'Ukończona'
    default:
      return status
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'ready':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function CurrentShoppingList() {
  const navigate = useNavigate()
  const { currentListId, stopShopping } = useShopping()

  const lists = useQuery(api.products.getAllShoppingLists) || []
  const products = useQuery(api.products.getAllProducts) || []
  const toggleItemChecked = useMutation(api.products.toggleItemChecked)

  const current = lists.find((l) => l._id === currentListId) || null

  if (!currentListId || !current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brak aktywnej listy zakupów</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Wybierz listę z sekcji „Listy” i kliknij „Zakupy”.
          </p>
          <Button onClick={() => navigate({ to: '/lists' })} variant="outline">
            Wróć do list
          </Button>
        </CardContent>
      </Card>
    )
  }

  const checkedItems = current.items.filter((i) => i.checked).length
  const totalItems = current.items.length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/lists">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Lista list
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            stopShopping()
            navigate({ to: '/lists' })
          }}
        >
          <Square className="h-4 w-4 mr-2" />
          Zakończ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {current.name}
            <Badge className={getStatusColor(current.status)}>
              {getStatusLabel(current.status)}
            </Badge>
          </CardTitle>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>
                Postęp: {checkedItems}/{totalItems}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {current.items.map((item, index) => {
              const product = products.find((p) => p._id === item.productId)
              if (!product) return null
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={async () => {
                      await toggleItemChecked({
                        listId: current._id as Id<'shoppingLists'>,
                        itemIndex: index,
                      })
                    }}
                    disabled={current.status === 'completed'}
                  />
                  <div className="flex-1">
                    <div
                      className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.quantity} {getUnitLabel(product.unit)}
                      {item.notes && ` • ${item.notes}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
