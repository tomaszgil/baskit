import React from 'react'
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
import { Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface ListItem {
  productId: Id<'products'> | ''
  quantity: number
  notes?: string
  checked: boolean
}

interface EditListFormData {
  name: string
  items: ListItem[]
}

export const Route = createFileRoute('/lists/$listId')({
  component: EditList,
})

function EditList() {
  const navigate = useNavigate()
  const { listId } = Route.useParams()
  const products = useQuery(api.products.getAllProducts) || []
  const shoppingList = useQuery(api.products.getShoppingListById, {
    id: listId as Id<'shoppingLists'>,
  })
  const updateShoppingList = useMutation(api.products.updateShoppingList)

  const form = useForm<EditListFormData>({
    defaultValues: {
      name: '',
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Reset form when shopping list data is loaded
  React.useEffect(() => {
    if (shoppingList) {
      form.reset({
        name: shoppingList.name,
        items: shoppingList.items,
      })
    }
  }, [shoppingList, form])

  const addProductToList = () => {
    append({
      productId: '' as Id<'products'>,
      quantity: 1,
      notes: '',
      checked: false,
    })
  }

  const onSubmit = async (data: EditListFormData) => {
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
      // Filter out items with empty productId
      const validItems = data.items.filter((item) => item.productId !== '')

      if (validItems.length === 0) {
        toast.error('Wszystkie produkty muszą mieć poprawną nazwę i ilość')
        return
      }

      await updateShoppingList({
        id: listId as Id<'shoppingLists'>,
        name: data.name,
        items: validItems as Array<{
          productId: Id<'products'>
          quantity: number
          notes?: string
          checked: boolean
        }>,
      })

      toast.success('Lista zakupów została zaktualizowana pomyślnie!')
      navigate({ to: '/lists' })
    } catch (error) {
      console.error('Błąd podczas zapisywania listy:', error)
      toast.error('Wystąpił błąd podczas aktualizacji listy')
    }
  }

  // Show loading state while data is being fetched
  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <DialogLayout
      title="Edytuj listę zakupów"
      actions={
        <div className="flex justify-between items-center py-4">
          <Button variant="outline" onClick={() => navigate({ to: '/lists' })}>
            Anuluj
          </Button>
          <Button form="edit-list-form" type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Zapisz zmiany
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="edit-list-form"
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
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
