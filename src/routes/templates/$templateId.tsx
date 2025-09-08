import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useMutation } from 'convex/react'

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
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import debounce from 'lodash/debounce'
import { z } from 'zod/v3'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormAutosave } from '@/lib/use-form-autosave'

const formSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  description: z.string().optional(),
  type: z.enum(['meal', 'set']),
  products: z
    .array(
      z.object({
        productId: z.string().min(1, 'Produkt jest wymagany'),
        quantity: z.number().min(1, 'Ilość jest wymagana'),
      }),
    )
    .min(1, 'Dodaj przynajmniej jeden produkt'),
})

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

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'meal',
      products: [],
    },
    values: template ? template : undefined,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'products',
  })

  const saveStatus = useFormAutosave(form, (data) =>
    updateTemplate({
      id: templateId as Id<'templates'>,
      name: data.name,
      description: data.description,
      type: data.type,
      products: data.products.map((product) => ({
        productId: product.productId as Id<'products'>,
        quantity: product.quantity,
      })),
    }),
  )

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
    <DialogLayout title="Edytuj szablon" headerActions={<StatusIndicator />}>
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
                      className="min-h-[100px]"
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
                  <Plus />
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
