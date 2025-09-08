import { createFileRoute } from '@tanstack/react-router'
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
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useFormAutosave } from '@/lib/use-form-autosave'
import { z } from 'zod/v3'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Produkt jest wymagany'),
      quantity: z.number().min(1, 'Ilość jest wymagana'),
      notes: z.string().optional(),
      checked: z.boolean(),
    }),
  ),
})

export const Route = createFileRoute('/lists/$listId/edit')({
  component: EditList,
})

function EditList() {
  const { listId } = Route.useParams()
  const products = useQuery(api.products.getProducts) || []
  const shoppingList = useQuery(api.lists.getListById, {
    id: listId as Id<'lists'>,
  })
  const updateShoppingList = useMutation(api.lists.updateList)

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      items: [],
    },
    values: shoppingList ? shoppingList : undefined,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const saveStatus = useFormAutosave(form, (data) =>
    updateShoppingList({
      id: listId as Id<'lists'>,
      name: data.name,
      items: data.items.filter((item) => item.productId !== '') as Array<{
        productId: Id<'products'>
        quantity: number
        notes?: string
        checked: boolean
      }>,
    }),
  )

  const addProductToList = () => {
    append({
      productId: '' as Id<'products'>,
      quantity: 1,
      notes: '',
      checked: false,
    })
  }

  // Status indicator component
  const StatusIndicator = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" /> Zapisano
          </div>
        )
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> Błąd zapisu
          </div>
        )
      default:
        return null
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
    <DialogLayout title="Edytuj listę" headerActions={<StatusIndicator />}>
      <Form {...form}>
        <form id="edit-list-form" className="space-y-6">
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
