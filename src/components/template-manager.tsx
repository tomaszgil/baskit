import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Plus, Trash2 } from 'lucide-react'

export function TemplateManager() {
  const navigate = useNavigate()

  const templates = useQuery(api.products.getAllTemplates) || []
  const products = useQuery(api.products.getAllProducts) || []
  const deleteTemplate = useMutation(api.products.deleteTemplate)

  const handleDelete = async (templateId: Id<'templates'>) => {
    if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
      try {
        await deleteTemplate({ id: templateId })
      } catch (error) {
        console.error('Błąd podczas usuwania szablonu:', error)
      }
    }
  }

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Szablony</h2>
        <Button onClick={() => navigate({ to: '/templates/create' })}>
          <Plus className="h-4 w-4 mr-2" />
          Nowy szablon
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template._id}>
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
                    onClick={() => handleDelete(template._id)}
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
                    const product = products.find(
                      (p) => p._id === item.productId,
                    )
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
        ))}
      </div>
    </div>
  )
}
