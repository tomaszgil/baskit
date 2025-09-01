import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FAB } from './ui/fab'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useShoppingStore } from '@/components/shopping-store'
import { Edit, Trash2, CheckCircle, ShoppingCart } from 'lucide-react'

interface ShoppingList {
  _id: Id<'shoppingLists'>
  name: string
  status: 'draft' | 'ready' | 'completed'
  items: Array<{
    productId: Id<'products'>
    quantity: number
    notes?: string
    checked: boolean
  }>
  createdAt: number
  updatedAt: number
}

export function ShoppingList() {
  const navigate = useNavigate()
  const { currentListId, startShopping } = useShoppingStore()

  const lists = useQuery(api.products.getAllShoppingLists) || []
  const updateShoppingList = useMutation(api.products.updateShoppingList)
  const deleteShoppingList = useMutation(api.products.deleteShoppingList)

  const handleEdit = (list: ShoppingList) => {
    navigate({ to: '/lists/$listId', params: { listId: list._id } })
  }

  const handleDelete = async (listId: Id<'shoppingLists'>) => {
    if (confirm('Czy na pewno chcesz usunąć tę listę?')) {
      try {
        await deleteShoppingList({ id: listId })
      } catch (error) {
        console.error('Błąd podczas usuwania listy:', error)
      }
    }
  }

  const handleMarkReady = async (listId: Id<'shoppingLists'>) => {
    try {
      await updateShoppingList({
        id: listId,
        status: 'ready',
      })
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error)
    }
  }

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
    <div className="space-y-6">
      <div className="grid gap-4">
        {lists.map((list) => {
          const totalItems = list.items.length

          return (
            <Card key={list._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      <span className="flex items-center gap-2">
                        {list.name}
                        {currentListId === list._id && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="relative inline-flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>W trakcie</TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                      <Badge className={getStatusColor(list.status)}>
                        {getStatusLabel(list.status)}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Utworzono:{' '}
                      {new Date(list.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(list)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(list._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń
                    </Button>
                  </div>
                </div>

                {list.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkReady(list._id)}
                    className="mt-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Oznacz jako gotową
                  </Button>
                )}

                {list.status === 'ready' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      startShopping(list._id)
                      navigate({ to: '/shopping' as any })
                    }}
                    className="mt-2"
                  >
                    <ShoppingCart />
                    Kupuj
                  </Button>
                )}
                <div className="mt-3 text-sm text-muted-foreground">
                  Produkty: {totalItems}
                </div>
              </CardHeader>

              <CardContent>
                {/* W trybie listy nie pokazujemy szczegółów */}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <FAB
        onClick={() => navigate({ to: '/lists/create' })}
        label="Utwórz nową listę zakupów"
      />
    </div>
  )
}
