import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

interface Template {
  _id: Id<'templates'>
  name: string
  description: string
  type: 'meal' | 'template'
  products: Array<{
    productId: Id<'products'>
    quantity: number
  }>
  createdAt: number
  updatedAt: number
}

interface TemplateFormData {
  name: string
  description: string
  type: 'meal' | 'template'
  products: Array<{
    productId: Id<'products'>
    quantity: number
  }>
}

export function TemplateManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    type: 'meal',
    products: [],
  })

  const templates = useQuery(api.products.getAllTemplates) || []
  const products = useQuery(api.products.getAllProducts) || []
  const createTemplate = useMutation(api.products.createTemplate)
  const updateTemplate = useMutation(api.products.updateTemplate)
  const deleteTemplate = useMutation(api.products.deleteTemplate)

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'meal',
      products: [],
    })
    setEditingTemplate(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTemplate) {
        await updateTemplate({
          id: editingTemplate._id,
          ...formData,
        })
      } else {
        await createTemplate(formData)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Błąd podczas zapisywania szablonu:', error)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      products: template.products,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (templateId: Id<'templates'>) => {
    if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
      try {
        await deleteTemplate({ id: templateId })
      } catch (error) {
        console.error('Błąd podczas usuwania szablonu:', error)
      }
    }
  }

  const addProductToTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        { productId: '' as Id<'products'>, quantity: 1 },
      ],
    }))
  }

  const removeProductFromTemplate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }))
  }

  const updateProductInTemplate = (
    index: number,
    field: 'productId' | 'quantity',
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product,
      ),
    }))
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nowy szablon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edytuj szablon' : 'Nowy szablon'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="np. Pasta Dinner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'meal' | 'template') =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meal">Posiłek</SelectItem>
                      <SelectItem value="template">Szablon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Opis szablonu..."
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Produkty</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProductToTemplate}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj produkt
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.products.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select
                        value={product.productId}
                        onValueChange={(value) =>
                          updateProductInTemplate(index, 'productId', value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Wybierz produkt" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p._id} value={p._id}>
                              {p.name} ({getUnitLabel(p.unit)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProductInTemplate(
                            index,
                            'quantity',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-20"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductFromTemplate(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Zapisz zmiany' : 'Utwórz szablon'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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
