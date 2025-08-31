import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface TemplateFormData {
  name: string
  description: string
  type: 'meal' | 'template'
  products: Array<{
    productId: Id<'products'> | ''
    quantity: number
  }>
}

export const Route = createFileRoute('/templates/create')({
  component: CreateTemplate,
})

function CreateTemplate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    type: 'meal',
    products: [],
  })

  const products = useQuery(api.products.getAllProducts) || []
  const createTemplate = useMutation(api.products.createTemplate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nazwa szablonu jest wymagana')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Opis szablonu jest wymagany')
      return
    }

    if (formData.products.length === 0) {
      toast.error('Dodaj przynajmniej jeden produkt do szablonu')
      return
    }

    try {
      const productsWithValidData = formData.products.filter(
        (product) => product.productId && product.quantity > 0,
      )

      if (productsWithValidData.length === 0) {
        toast.error('Wszystkie produkty muszą mieć poprawną nazwę i ilość')
        return
      }

      await createTemplate({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        products: productsWithValidData.map((product) => ({
          productId: product.productId as Id<'products'>,
          quantity: product.quantity,
        })),
      })

      toast.success('Szablon został utworzony pomyślnie!')
      navigate({ to: '/templates' })
    } catch (error) {
      console.error('Błąd podczas zapisywania szablonu:', error)
      toast.error('Wystąpił błąd podczas tworzenia szablonu')
    }
  }

  const addProductToTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { productId: '', quantity: 1 }],
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-2xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/templates' })}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Nowy szablon</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                  className="text-lg"
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
                className="min-h-[100px] text-lg"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Produkty</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProductToTemplate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj produkt
                </Button>
              </div>

              <div className="space-y-3">
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-center p-3 border rounded-lg bg-card"
                  >
                    <Select
                      value={product.productId}
                      onValueChange={(value) =>
                        updateProductInTemplate(index, 'productId', value)
                      }
                    >
                      <SelectTrigger>
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
                      className="w-24"
                      placeholder="Ilość"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductFromTemplate(index)}
                      className="h-10 w-10 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/templates' })}
            >
              Anuluj
            </Button>
            <Button onClick={handleSubmit} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Utwórz szablon
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
