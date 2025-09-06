import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FAB } from './ui/fab'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { EmptyState } from './ui/empty-state'
import { Skeleton } from './ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useShoppingStore } from '@/components/shopping-store'
import {
  Edit,
  Trash2,
  CheckCircle,
  ShoppingCart,
  ClipboardList,
  MoreHorizontal,
} from 'lucide-react'
import { useConfirmDialog } from './confirm-dialog'
import { toast } from 'sonner'

interface ShoppingList {
  _id: Id<'lists'>
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

interface ShoppingListCardProps {
  list: ShoppingList
  currentListId: Id<'lists'> | null
  onEdit: (list: ShoppingList) => void
  onDelete: (listId: Id<'lists'>) => Promise<void>
  onMarkReady: (listId: Id<'lists'>) => Promise<void>
  onMarkDraft: (listId: Id<'lists'>) => Promise<void>
  onStartShopping: (listId: Id<'lists'>) => void
  onFinishShopping: (listId: Id<'lists'>) => Promise<void>
}

function ShoppingListCard({
  list,
  currentListId,
  onEdit,
  onDelete,
  onMarkReady,
  onMarkDraft,
  onStartShopping,
  onFinishShopping,
}: ShoppingListCardProps) {
  const { openDialog, ConfirmDialog } = useConfirmDialog(
    async () => {
      await onDelete(list._id)
    },
    {
      title: 'Usuń listę zakupów',
      description: `Czy na pewno chcesz usunąć listę "${list.name}"? Ta operacja nie może zostać cofnięta.`,
      actionLabel: 'Usuń',
    },
  )

  const checkedItems = list.items.filter((i) => i.checked).length
  const allItemsChecked = checkedItems === list.items.length

  const { openDialog: openFinishDialog, ConfirmDialog: FinishConfirmDialog } =
    useConfirmDialog(
      async () => {
        await onFinishShopping(list._id)
      },
      {
        title: 'Ukończ listę zakupów',
        description: allItemsChecked
          ? 'Czy na pewno chcesz ukończyć tę listę zakupów?'
          : `Nie wszystkie produkty zostały zaznaczone (${checkedItems}/${list.items.length}). Czy na pewno chcesz ukończyć listę zakupów?`,
        actionLabel: 'Ukończ',
      },
    )

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

  const renderActions = () => {
    const isCurrentlyShopping = currentListId === list._id
    const isReadyAndShopping = list.status === 'ready' && isCurrentlyShopping

    const getDropdownItems = () => {
      switch (list.status) {
        case 'draft':
          return (
            <>
              <DropdownMenuItem onClick={() => onMarkReady(list._id)}>
                <CheckCircle className="h-4 w-4" />
                Oznacz jako gotową
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(list)}>
                <Edit className="h-4 w-4" />
                Edytuj
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openDialog} variant="destructive">
                <Trash2 className="h-4 w-4" />
                Usuń
              </DropdownMenuItem>
            </>
          )
        case 'ready':
          if (isReadyAndShopping) {
            // Ready & shopping actions
            return (
              <>
                <DropdownMenuItem onClick={() => onStartShopping(list._id)}>
                  <ShoppingCart className="h-4 w-4" />
                  Kupuj
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openFinishDialog}>
                  <CheckCircle className="h-4 w-4" />
                  Oznacz jako ukończoną
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(list)}>
                  <Edit className="h-4 w-4" />
                  Edytuj
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDialog} variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </DropdownMenuItem>
              </>
            )
          } else {
            // Ready (not shopping) actions
            return (
              <>
                <DropdownMenuItem onClick={() => onStartShopping(list._id)}>
                  <ShoppingCart className="h-4 w-4" />
                  Kupuj
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMarkDraft(list._id)}>
                  <ClipboardList className="h-4 w-4" />
                  Oznacz jako szkic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(list)}>
                  <Edit className="h-4 w-4" />
                  Edytuj
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDialog} variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </DropdownMenuItem>
              </>
            )
          }
        case 'completed':
          return (
            <DropdownMenuItem onClick={openDialog} variant="destructive">
              <Trash2 className="h-4 w-4" />
              Usuń
            </DropdownMenuItem>
          )
        default:
          return null
      }
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {getDropdownItems()}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div>
      <Card className="hover:shadow-md transition-shadow">
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
            {renderActions()}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            {list.items.length}
          </div>
        </CardHeader>

        <CardContent>
          {/* W trybie listy nie pokazujemy szczegółów */}
        </CardContent>
      </Card>
      {ConfirmDialog}
      {FinishConfirmDialog}
    </div>
  )
}

export function ShoppingList() {
  const navigate = useNavigate()
  const { currentListId, startShopping, stopShopping } = useShoppingStore()

  const lists = useQuery(api.lists.getLists)
  const updateShoppingList = useMutation(api.lists.updateList)
  const deleteShoppingList = useMutation(api.lists.deleteList)

  // Show skeleton loading state when query returns undefined
  if (lists === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-40 mt-2" />
                <Skeleton className="h-4 w-20 mt-3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const handleEdit = (list: ShoppingList) => {
    navigate({ to: '/lists/$listId', params: { listId: list._id } })
  }

  const handleDelete = async (listId: Id<'lists'>) => {
    await deleteShoppingList({ id: listId })
  }

  const handleMarkReady = async (listId: Id<'lists'>) => {
    try {
      await updateShoppingList({
        id: listId,
        status: 'ready',
      })
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error)
    }
  }

  const handleStartShopping = (listId: Id<'lists'>) => {
    startShopping(listId)
    navigate({ to: '/shopping' })
  }

  const handleMarkDraft = async (listId: Id<'lists'>) => {
    try {
      await updateShoppingList({
        id: listId,
        status: 'draft',
      })
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error)
    }
  }

  const handleFinishShopping = async (listId: Id<'lists'>) => {
    try {
      await updateShoppingList({ id: listId, status: 'completed' })
      stopShopping()
      toast.success('Lista zakupów została ukończona!')
    } catch (error) {
      console.error('Błąd podczas ukończenia listy:', error)
      toast.error('Wystąpił błąd podczas ukończenia listy')
    }
  }

  if (lists.length === 0) {
    return (
      <EmptyState
        illustration={<ClipboardList className="h-16 w-16 text-gray-300" />}
        title="Brak list zakupów"
        description="Utwórz swoją pierwszą listę zakupów, aby rozpocząć organizowanie zakupów. Możesz tworzyć listy od podstaw lub używać gotowych szablonów."
        action={
          <Button onClick={() => navigate({ to: '/lists/create' })}>
            Utwórz pierwszą listę
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {lists.map((list) => (
          <ShoppingListCard
            key={list._id}
            list={list}
            currentListId={currentListId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkReady={handleMarkReady}
            onMarkDraft={handleMarkDraft}
            onStartShopping={handleStartShopping}
            onFinishShopping={handleFinishShopping}
          />
        ))}
      </div>

      <FAB
        onClick={() => navigate({ to: '/lists/create' })}
        label="Utwórz nową listę zakupów"
      />
    </div>
  )
}
