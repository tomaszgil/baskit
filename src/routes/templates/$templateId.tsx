import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useMutation } from 'convex/react'
import React, { useEffect, useState } from 'react'

import { api } from '~/convex/_generated/api'
import type { Id } from '~/convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { debounce } from '@/lib/debounce'

interface TemplateFormData {
  name: string
  description: string
  type: 'meal' | 'set'
  products: Array<{
    productId: string
    quantity: number
  }>
}

export const Route = createFileRoute('/templates/$templateId')({
  component: EditTemplate,
})

function EditTemplate() {
  const navigate = useNavigate()
  const { templateId } = useParams({ from: '/templates/$templateId' })

  const template = useQuery(api.templates.getTemplateById, {
    id: templateId as Id<'templates'>,
  })
  const products = useQuery(api.products.getProducts) || []
  const updateTemplate = useMutation(api.templates.updateTemplate)
  const [status, setStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [isInitialized, setIsInitialized] = useState(false)

  const form = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: 'meal',
      products: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'products',
  })

  // Pre-populate form when template data is loaded
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description,
        type: template.type,
        products: template.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      })
      setStatus('saved')
      setIsInitialized(true)
    }
  }, [template, form])

  const saveNow = async (data: TemplateFormData) => {
    if (!data.name.trim()) {
      setStatus('saved') // Invalid data, but no need to save
      return
    }
    if (!data.description.trim()) {
      setStatus('saved') // Invalid data, but no need to save
      return
    }
    if (data.products.length === 0) {
      setStatus('saved') // Invalid data, but no need to save
      return
    }

    try {
      const productsWithValidData = data.products.filter(
        (product) => product.productId && product.quantity > 0,
      )
      if (productsWithValidData.length === 0) {
        setStatus('saved') // Invalid data, but no need to save
        return
      }

      setStatus('saving')
      await updateTemplate({
        id: templateId as Id<'templates'>,
        name: data.name,
        description: data.description,
        type: data.type,
        products: productsWithValidData.map((product) => ({
          productId: product.productId as Id<'products'>,
          quantity: product.quantity,
        })),
      })
      setStatus('saved')
    } catch (error) {
      console.error('Błąd podczas aktualizacji szablonu:', error)
      setStatus('error')
      toast.error('Wystąpił błąd podczas aktualizacji szablonu')
    }
  }

  // Debounced autosave on any form change
  const debouncedSave = React.useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const data = args[0] as TemplateFormData
        void saveNow(data)
      }, 1000),
    [saveNow],
  )

  useEffect(() => {
    if (!isInitialized) return

    const subscription = form.watch(() => {
      setStatus('saving')
      const current = form.getValues()
      debouncedSave(current)
    })
    return () => subscription.unsubscribe()
  }, [form, debouncedSave, isInitialized])

  const addProductToTemplate = () => {
    append({ productId: '', quantity: 1 })
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

  // Show loading state while template is being fetched
  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie szablonu...</p>
        </div>
      </div>
    )
  }

  // Show error state if template is not found
  if (template === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">
            Szablon nie został znaleziony
          </p>
          <Button onClick={() => navigate({ to: '/templates' })}>
            Wróć do listy szablonów
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DialogLayout
      title={
        <div className="flex items-center gap-3">
          <span>Edytuj szablon</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={
                status === 'saving'
                  ? 'inline-block h-2.5 w-2.5 rounded-full bg-yellow-500'
                  : status === 'error'
                    ? 'inline-block h-2.5 w-2.5 rounded-full bg-red-500'
                    : 'inline-block h-2.5 w-2.5 rounded-full bg-green-500'
              }
              aria-label={
                status === 'saving'
                  ? 'Zapisywanie'
                  : status === 'error'
                    ? 'Błąd zapisu'
                    : 'Zapisano'
              }
            />
            <span>
              {status === 'saving'
                ? 'Zapisywanie...'
                : status === 'error'
                  ? 'Błąd zapisu'
                  : 'Zapisano'}
            </span>
          </div>
        </div>
      }
      actions={<div />}
    >
      <Form {...form}>
        <form id="edit-template-form" className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="np. Pasta Dinner"
                        className="text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="meal">Posiłek</SelectItem>
                        <SelectItem value="set">Zestaw</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Opis szablonu..."
                      className="min-h-[100px] text-lg"
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
                  onClick={addProductToTemplate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj produkt
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-3 items-center p-3 border rounded-lg bg-card"
                  >
                    <FormField
                      control={form.control}
                      name={`products.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
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

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
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
      </Form>
    </DialogLayout>
  )
}
