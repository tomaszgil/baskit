import { useQuery, useMutation } from 'convex/react'
import { Link, useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { ListStatusBadge } from './list-status-badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { FAB } from './ui/fab'
import { EmptyState } from './ui/empty-state'
import { Skeleton } from './ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Edit,
  Trash2,
  CheckCircle,
  ShoppingCart,
  ClipboardList,
  MoreHorizontal,
  Calendar,
} from 'lucide-react'
import { useConfirmDialog } from './confirm-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

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
  onEdit: (list: ShoppingList) => void
  onDelete: (listId: Id<'lists'>) => Promise<void>
  onMarkReady: (listId: Id<'lists'>) => Promise<void>
  onMarkDraft: (listId: Id<'lists'>) => Promise<void>
  onStartShopping: (listId: Id<'lists'>) => void
}

function ShoppingListCard({
  list,
  onEdit,
  onDelete,
  onMarkReady,
  onMarkDraft,
  onStartShopping,
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

  const renderActions = () => {
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
          <CardAction>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {getDropdownItems()}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {list.status === 'draft' && (
              <Link to={`/lists/$listId/edit`} params={{ listId: list._id }}>
                {list.name}
              </Link>
            )}
            {list.status === 'ready' && (
              <Link to={`/lists/$listId/shop`} params={{ listId: list._id }}>
                {list.name}
              </Link>
            )}
            {list.status === 'completed' && list.name}
            <ListStatusBadge status={list.status} />
          </CardTitle>
          <CardDescription>
            <div className="flex gap-4 items-center">
              <Tooltip delayDuration={300}>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" />
                    {list.items.length}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Liczba produktów</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(list.createdAt).toLocaleDateString('pl-PL')}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Data utworzenia</TooltipContent>
              </Tooltip>
            </div>
          </CardDescription>
          {renderActions()}
        </CardHeader>
      </Card>
      {ConfirmDialog}
    </>
  )
}

export function ShoppingList() {
  const navigate = useNavigate()

  const lists = useQuery(api.lists.getLists)
  const updateShoppingList = useMutation(api.lists.updateList)
  const deleteShoppingList = useMutation(api.lists.deleteList)

  // Show skeleton loading state when query returns undefined
  if (lists === undefined) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="flex gap-4 items-center mt-2">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const handleEdit = (list: ShoppingList) => {
    navigate({ to: '/lists/$listId/edit', params: { listId: list._id } })
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
    navigate({ to: '/lists/$listId/shop', params: { listId } })
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkReady={handleMarkReady}
            onMarkDraft={handleMarkDraft}
            onStartShopping={handleStartShopping}
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
