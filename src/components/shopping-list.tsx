import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
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

import type { Id } from '../../convex/_generated/dataModel'

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
  productId: Id<'products'>
  quantity: number
  notes?: string
  checked: boolean
}

export function ShoppingList() {
  const navigate = useNavigate()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<ShoppingList | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    selectedTemplate: '' as Id<'templates'> | '',
    multiplier: 1,
    items: [] as ListItem[],
  })

  const lists = useQuery(api.products.getAllShoppingLists) || []
  const products = useQuery(api.products.getAllProducts) || []

  const updateShoppingList = useMutation(api.products.updateShoppingList)
  const deleteShoppingList = useMutation(api.products.deleteShoppingList)
  const toggleItemChecked = useMutation(api.products.toggleItemChecked)

  const resetForm = () => {
    setFormData({
      name: '',
      selectedTemplate: '',
      multiplier: 1,
      items: [],
    })
    setEditingList(null)
  }

  const addProductToList = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '' as Id<'products'>,
          quantity: 1,
          notes: '',
          checked: false,
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
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateShoppingList({
        id: editingList!._id,
        name: formData.name,
        items: formData.items,
      })

      resetForm()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Błąd podczas zapisywania listy:', error)
    }
  }

  const handleEdit = (list: ShoppingList) => {
    setEditingList(list)
    setFormData({
      name: list.name,
      selectedTemplate: '',
      multiplier: 1,
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
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listy zakupów</h2>
        <Button onClick={() => navigate({ to: '/lists/create' })}>
          <Plus className="h-4 w-4 mr-2" />
          Nowa lista
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Card key={list._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(list.status)}`}
                    >
                      {getStatusLabel(list.status)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {list.items.length} produktów
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {list.status === 'draft' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(list)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkReady(list._id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(list._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {list.status === 'draft' ? (
                <div className="space-y-2">
                  {list.items.map((item, index) => {
                    const product = products.find(
                      (p) => p._id === item.productId,
                    )
                    return product ? (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{product.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} {getUnitLabel(product.unit)}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {list.items.map((item, index) => {
                    const product = products.find(
                      (p) => p._id === item.productId,
                    )
                    return product ? (
                      <div key={index} className="flex items-center gap-3">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() =>
                            handleToggleItem(list._id, index)
                          }
                          className="h-5 w-5"
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
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj listę</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nazwa listy</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
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
                  onClick={addProductToList}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj produkt
                </Button>
              </div>

              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-2 items-center"
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
