import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useMutation } from 'convex/react'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogLayout } from '@/components/layout/dialog-layout'
import { Plus, Save, ShoppingCart, X } from 'lucide-react'
import { toast } from 'sonner'

interface ListItem {
  productId: Id<'products'> | ''
  quantity: number
  notes: string
}

interface CreateListFormData {
  name: string
  selectedTemplate: Id<'templates'> | ''
  multiplier: number
  items: ListItem[]
}

export const Route = createFileRoute('/lists/create')({
  component: CreateList,
})

function CreateList() {
  const navigate = useNavigate()
  const templates = useQuery(api.templates.getTemplates) || []
  const products = useQuery(api.products.getProducts) || []
  const createShoppingList = useMutation(api.lists.createList)

  const form = useForm<CreateListFormData>({
    defaultValues: {
      name: '',
      selectedTemplate: '',
      multiplier: 1,
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const handleCreateFromTemplate = () => {
    const selectedTemplate = form.getValues('selectedTemplate')
    const name = form.getValues('name')

    if (selectedTemplate && name) {
      const template = templates.find((t) => t._id === selectedTemplate)
      if (template) {
        const templateItems = template.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity * form.getValues('multiplier'),
          notes: '',
        }))

        // Get existing items
        const existingItems = form.getValues('items')

        // Create a map to track existing products
        const existingItemsMap = new Map<string, ListItem>()
        existingItems.forEach((item) => {
          if (item.productId) {
            existingItemsMap.set(item.productId, item)
          }
        })

        // Merge template items with existing items
        const mergedItems = [...existingItems]

        templateItems.forEach((templateItem) => {
          if (templateItem.productId) {
            const existingItem = existingItemsMap.get(templateItem.productId)
            if (existingItem) {
              // Product exists, add quantities
              existingItem.quantity += templateItem.quantity
            } else {
              // Product doesn't exist, add new item
              mergedItems.push(templateItem)
            }
          }
        })

        form.setValue('items', mergedItems)
      }
    }
  }

  const onSubmit = async (data: CreateListFormData) => {
    // Manual validation
    if (!data.name.trim()) {
      toast.error('Nazwa listy jest wymagana')
      return
    }

    if (data.items.length === 0) {
      toast.error('Dodaj przynajmniej jeden produkt do listy')
      return
    }

    try {
      const itemsWithValidProducts = data.items.filter(
        (item) => item.productId && item.quantity > 0,
      )

      if (itemsWithValidProducts.length === 0) {
        toast.error('Wszystkie produkty muszą mieć poprawną nazwę i ilość')
        return
      }

      await createShoppingList({
        name: data.name,
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
    append({
      productId: '',
      quantity: 1,
      notes: '',
    })
  }

  return (
    <DialogLayout
      title="Nowa lista zakupów"
      footerActions={
        <div className="flex justify-between items-center py-4">
          <Button variant="outline" onClick={() => navigate({ to: '/lists' })}>
            Anuluj
          </Button>
          <Button form="create-list-form" type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Utwórz listę
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="create-list-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa listy</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="np. Zakupy na weekend"
                      className="text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="selectedTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Szablon (opcjonalnie)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz szablon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mnożnik</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        step="1"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch('selectedTemplate') && (
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
                <FormLabel className="text-lg font-medium">Produkty</FormLabel>
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
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-4 gap-3 items-center p-3 border rounded-lg bg-card"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0.1"
                              step="0.1"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              placeholder="Ilość"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="Notatki" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </DialogLayout>
  )
}
