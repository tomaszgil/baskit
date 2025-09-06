import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
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
  Trash2,
  Edit,
  ClipboardList,
  MoreHorizontal,
  Calendar,
} from 'lucide-react'
import { useConfirmDialog } from './confirm-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { TemplateTypeBadge } from './template-type-badge'

interface Template {
  _id: Id<'templates'>
  name: string
  description: string
  type: 'meal' | 'set'
  products: Array<{
    productId: Id<'products'>
    quantity: number
  }>
  createdAt: number
  updatedAt: number
}

interface TemplateCardProps {
  template: Template
  onEdit: (templateId: Id<'templates'>) => void
  onDelete: (templateId: Id<'templates'>) => Promise<void>
}

function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const { openDialog, ConfirmDialog } = useConfirmDialog(
    async () => {
      await onDelete(template._id)
    },
    {
      title: 'Usuń szablon',
      description: `Czy na pewno chcesz usunąć szablon "${template.name}"? Ta operacja nie może zostać cofnięta.`,
      actionLabel: 'Usuń',
    },
  )

  const renderActions = () => {
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
          <DropdownMenuItem onClick={() => onEdit(template._id)}>
            <Edit className="h-4 w-4" />
            Edytuj
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDialog} variant="destructive">
            <Trash2 className="h-4 w-4" />
            Usuń
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {template.name}
            <TemplateTypeBadge status={template.type} />
          </CardTitle>
          <CardDescription className="flex flex-col gap-2">
            {template.description}

            <div className="flex gap-4 items-center">
              <Tooltip delayDuration={300}>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" />
                    {template.products.length}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Liczba produktów</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(template.createdAt).toLocaleDateString('pl-PL')}
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

export function TemplateManager() {
  const navigate = useNavigate()

  const templates = useQuery(api.templates.getTemplates)
  const deleteTemplate = useMutation(api.templates.deleteTemplate)

  // Show skeleton loading state when query returns undefined
  if (templates === undefined) {
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
                    <Skeleton className="h-4 w-64 mt-2" />
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

  const handleEdit = (templateId: Id<'templates'>) => {
    navigate({ to: `/templates/${templateId}` })
  }

  const handleDelete = async (templateId: Id<'templates'>) => {
    await deleteTemplate({ id: templateId })
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        illustration={<ClipboardList className="h-16 w-16 text-gray-300" />}
        title="Brak szablonów"
        description="Utwórz swój pierwszy szablon, aby szybko tworzyć powtarzalne listy zakupów. Szablony pomogą Ci zaoszczędzić czas przy planowaniu posiłków i zakupów."
        action={
          <Button onClick={() => navigate({ to: '/templates/create' })}>
            Utwórz pierwszy szablon
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <FAB
        onClick={() => navigate({ to: '/templates/create' })}
        label="Utwórz nowy szablon"
      />
    </div>
  )
}
