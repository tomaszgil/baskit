import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FAB } from './ui/fab'
import { EmptyState } from './ui/empty-state'
import { Skeleton } from './ui/skeleton'
import { Trash2, Edit, ClipboardList } from 'lucide-react'
import { useConfirmDialog } from './confirm-dialog'

interface Template {
  _id: Id<'templates'>
  name: string
  description: string
  products: Array<{
    productId: Id<'products'>
    quantity: number
  }>
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

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(template._id)}
                title="Edytuj szablon"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openDialog}
                title="Usuń szablon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Produkty:</span>
              <span className="text-sm text-muted-foreground">
                {template.products.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      {ConfirmDialog}
    </div>
  )
}

export function TemplateManager() {
  const navigate = useNavigate()

  const templates = useQuery(api.templates.getTemplates)
  const deleteTemplate = useMutation(api.templates.deleteTemplate)

  // Show skeleton loading state when query returns undefined
  if (templates === undefined) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
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
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1">
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
