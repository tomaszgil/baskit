import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useConfirmDialog } from '@/components/confirm-dialog'
import { ArrowLeft, Square } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/lists/$listId/shop')({
  component: ShoppingPage,
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

function ShoppingPage() {
  const navigate = useNavigate()
  const { listId } = Route.useParams()

  const products = useQuery(api.products.getProducts) || []
  const setItemChecked = useMutation(api.lists.setItemChecked)
  const updateList = useMutation(api.lists.updateList)
  const current = useQuery(api.lists.getListById, {
    id: listId as Id<'lists'>,
  })

  const handleFinishShopping = async () => {
    if (!current) return

    try {
      await updateList({ id: current._id, status: 'completed' })
      navigate({ to: '/lists' })
      toast.success('Lista zakupów została ukończona!')
    } catch (error) {
      console.error('Błąd podczas ukończenia listy:', error)
      toast.error('Wystąpił błąd podczas ukończenia listy')
    }
  }

  const { openDialog, ConfirmDialog } = useConfirmDialog(handleFinishShopping, {
    title: 'Ukończ listę zakupów',
    description: current
      ? (() => {
          const checkedItems = current.items.filter((i) => i.checked).length
          const totalItems = current.items.length
          const allItemsChecked = checkedItems === totalItems
          return allItemsChecked
            ? 'Czy na pewno chcesz ukończyć tę listę zakupów?'
            : `Nie wszystkie produkty zostały zaznaczone (${checkedItems}/${totalItems}). Czy na pewno chcesz ukończyć listę zakupów?`
        })()
      : 'Czy na pewno chcesz ukończyć tę listę zakupów?',
    actionLabel: 'Ukończ',
  })

  // Show loading state while data is being fetched
  if (!current) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
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
            Wszystkie listy
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={openDialog}>
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
                    onCheckedChange={async (checked) => {
                      await setItemChecked({
                        listId: current._id,
                        productId: item.productId,
                        checked: !!checked,
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
      {ConfirmDialog}
    </div>
  )
}
