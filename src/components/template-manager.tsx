import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FAB } from './ui/fab'
import { Trash2, Edit } from 'lucide-react'
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

interface Product {
  _id: Id<'products'>
  name: string
  unit: string
}

interface TemplateCardProps {
  template: Template
  products: Product[]
  onEdit: (templateId: Id<'templates'>) => void
  onDelete: (templateId: Id<'templates'>) => Promise<void>
}

function TemplateCard({
  template,
  products,
  onEdit,
  onDelete,
}: TemplateCardProps) {
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

  const getUnitLabel = (unit: string) => {
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
            <div className="text-xs text-muted-foreground">
              {template.products.map((item, index) => {
                const product = products.find((p) => p._id === item.productId)
                return product ? (
                  <div key={index}>
                    {product.name} - {item.quantity}{' '}
                    {getUnitLabel(product.unit)}
                  </div>
                ) : null
              })}
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

  const templates = useQuery(api.products.getAllTemplates) || []
  const products = useQuery(api.products.getAllProducts) || []
  const deleteTemplate = useMutation(api.products.deleteTemplate)

  const handleEdit = (templateId: Id<'templates'>) => {
    navigate({ to: `/templates/${templateId}` })
  }

  const handleDelete = async (templateId: Id<'templates'>) => {
    await deleteTemplate({ id: templateId })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1">
        {templates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            products={products}
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
