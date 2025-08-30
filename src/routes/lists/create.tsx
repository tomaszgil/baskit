import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Save, ShoppingCart, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Id } from '../../../convex/_generated/dataModel'

interface ListItem {
  productId: Id<'products'> | ''
  quantity: number
  notes: string
}

export const Route = createFileRoute('/lists/create')({
  component: CreateList,
})

function CreateList() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    selectedTemplate: '' as Id<'templates'> | '',
    multiplier: 1,
    items: [] as ListItem[],
  })

  const templates = useQuery(api.products.getAllTemplates) || []
  const products = useQuery(api.products.getAllProducts) || []
  const createShoppingList = useMutation(api.products.createShoppingList)

  const handleCreateFromTemplate = () => {
    if (formData.selectedTemplate && formData.name) {
      const template = templates.find(
        (t) => t._id === formData.selectedTemplate,
      )
      if (template) {
        const items = template.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity * formData.multiplier,
          notes: '',
        }))

        setFormData((prev) => ({ ...prev, items }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nazwa listy jest wymagana')
      return
    }

    if (formData.items.length === 0) {
      toast.error('Dodaj przynajmniej jeden produkt do listy')
      return
    }

    try {
      const itemsWithValidProducts = formData.items.filter(
        (item) => item.productId && item.quantity > 0,
      )

      if (itemsWithValidProducts.length === 0) {
        toast.error('Wszystkie produkty muszą mieć poprawną nazwę i ilość')
        return
      }

      await createShoppingList({
        name: formData.name,
        items: itemsWithValidProducts.map((item) => ({
          productId: item.productId as Id<'products'>,
          quantity: item.quantity,
          notes: item.notes,
          checked: false,
        })),
      })

      toast.success('Lista zakupów została utworzona pomyślnie!')
      navigate({ to: '/lists' })
    } catch (error) {
      console.error('Błąd podczas zapisywania listy:', error)
      toast.error('Wystąpił błąd podczas tworzenia listy')
    }
  }

  const addProductToList = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          quantity: 1,
          notes: '',
        },
      ],
    }))
  }

  const removeProductFromList = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateProductInList = (
    index: number,
    field: keyof ListItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }))
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
              onClick={() => navigate({ to: '/lists' })}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Nowa lista zakupów</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa listy</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="np. Zakupy na weekend"
                required
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">Szablon (opcjonalnie)</Label>
                <Select
                  value={formData.selectedTemplate}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedTemplate: value as Id<'templates'> | '',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz szablon" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplier">Mnożnik</Label>
                <Input
                  id="multiplier"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.multiplier}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      multiplier: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>

            {formData.selectedTemplate && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateFromTemplate}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Utwórz z szablonu
              </Button>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Produkty</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProductToList}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj produkt
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-3 items-center p-3 border rounded-lg bg-card"
                  >
                    <Select
                      value={item.productId}
                      onValueChange={(value) =>
                        updateProductInList(index, 'productId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produkt" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateProductInList(
                          index,
                          'quantity',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Ilość"
                    />

                    <Input
                      value={item.notes}
                      onChange={(e) =>
                        updateProductInList(index, 'notes', e.target.value)
                      }
                      placeholder="Notatki"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductFromList(index)}
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
              onClick={() => navigate({ to: '/lists' })}
            >
              Anuluj
            </Button>
            <Button onClick={handleSubmit} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Utwórz listę
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
