import { useQuery } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '~/convex/_generated/api'
import { useShoppingStore } from '@/components/shopping-store'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ShoppingCart, Play, Plus, List } from 'lucide-react'

export function CurrentListCard() {
  const navigate = useNavigate()
  const { currentListId } = useShoppingStore()

  const currentList = useQuery(
    api.products.getShoppingList,
    currentListId ? { id: currentListId } : 'skip',
  )

  // Empty state when no active list
  if (!currentListId || !currentList) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart />
            Brak aktywnej listy zakupów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Nie masz obecnie aktywnej listy zakupów. Utwórz nową listę lub
              wybierz istniejącą.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate({ to: '/lists/create' as any })}
                className="flex-1"
              >
                <Plus />
                Utwórz nową listę
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/lists' as any })}
              >
                <List />
                Wszystkie listy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const checkedItems = currentList.items.filter((item) => item.checked).length
  const totalItems = currentList.items.length
  const progressPercentage =
    totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  const getStatusLabel = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                {currentList.name}
                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
              </span>
              <Badge className={getStatusColor(currentList.status)}>
                {getStatusLabel(currentList.status)}
              </Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Postęp: {checkedItems}/{totalItems} produktów
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => navigate({ to: '/shopping' as any })}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Kontynuuj zakupy
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/lists' as any })}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Wszystkie listy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
