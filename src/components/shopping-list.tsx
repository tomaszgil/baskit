import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Plus, Edit, Trash2, Save, CheckCircle, X } from 'lucide-react'

interface ShoppingList {
  _id: Id<'shoppingLists'>
  name: string
  status: 'draft' | 'ready' | 'completed'
  items: Array<{
    productId: Id<'products'>
    quantity: number
    notes?: string
    checked: boolean
  }>
  createdAt: number
  updatedAt: number
}

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

export function ShoppingList() {
  const navigate = useNavigate()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<ShoppingList | null>(null)

  const lists = useQuery(api.products.getAllShoppingLists) || []
  const products = useQuery(api.products.getAllProducts) || []

  const updateShoppingList = useMutation(api.products.updateShoppingList)
  const deleteShoppingList = useMutation(api.products.deleteShoppingList)
  const toggleItemChecked = useMutation(api.products.toggleItemChecked)

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

  const resetForm = () => {
    form.reset({
      name: '',
      items: [],
    })
    setEditingList(null)
  }

  const addProductToList = () => {
    append({
      productId: '' as Id<'products'>,
      quantity: 1,
      notes: '',
      checked: false,
    })
  }

  const onSubmit = async (data: EditListFormData) => {
    if (!editingList) return

    // Filter out items with empty productId
    const validItems = data.items.filter((item) => item.productId !== '')

    try {
      await updateShoppingList({
        id: editingList._id,
        name: data.name,
        items: validItems as Array<{
          productId: Id<'products'>
          quantity: number
          notes?: string
          checked: boolean
        }>,
      })

      resetForm()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Błąd podczas zapisywania listy:', error)
    }
  }

  const handleEdit = (list: ShoppingList) => {
    setEditingList(list)
    form.reset({
      name: list.name,
      items: list.items,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (listId: Id<'shoppingLists'>) => {
    if (confirm('Czy na pewno chcesz usunąć tę listę?')) {
      try {
        await deleteShoppingList({ id: listId })
      } catch (error) {
        console.error('Błąd podczas usuwania listy:', error)
      }
    }
  }

  const handleMarkReady = async (listId: Id<'shoppingLists'>) => {
    try {
      await updateShoppingList({
        id: listId,
        status: 'ready',
      })
    } catch (error) {
      console.error('Błąd podczas zmiany statusu:', error)
    }
  }

  const handleToggleItem = async (
    listId: Id<'shoppingLists'>,
    itemIndex: number,
  ) => {
    try {
      await toggleItemChecked({
        listId,
        itemIndex,
      })
    } catch (error) {
      console.error('Błąd podczas zaznaczania elementu:', error)
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Szkic'
      case 'ready':
        return 'Gotowa'
      case 'completed':
        return 'Ukończona'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listy zakupów</h2>
        <Button onClick={() => navigate({ to: '/lists/create' })}>
          <Plus className="h-4 w-4 mr-2" />
          Nowa lista
        </Button>
      </div>

      <div className="grid gap-4">
        {lists.map((list) => {
          const checkedItems = list.items.filter((item) => item.checked).length
          const totalItems = list.items.length
          const progress =
            totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

          return (
            <Card key={list._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      {list.name}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          list.status,
                        )}`}
                      >
                        {getStatusLabel(list.status)}
                      </span>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Utworzono:{' '}
                      {new Date(list.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(list)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(list._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń
                    </Button>
                  </div>
                </div>

                {list.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkReady(list._id)}
                    className="mt-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Oznacz jako gotową
                  </Button>
                )}

                <div className="mt-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>
                      Postęp: {checkedItems}/{totalItems}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {list.items.length > 0 && (
                  <div className="space-y-2">
                    {list.items.map((item, index) => {
                      const product = products.find(
                        (p) => p._id === item.productId,
                      )
                      return product ? (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() =>
                              handleToggleItem(list._id, index)
                            }
                            disabled={list.status === 'completed'}
                          />
                          <div className="flex-1">
                            <div
                              className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.quantity} {getUnitLabel(product.unit)}
                              {item.notes && ` • ${item.notes}`}
                            </div>
                          </div>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj listę</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa listy</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Produkty</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProductToList}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj produkt
                  </Button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-4 gap-2 items-center"
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
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
