import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface TemplateFormData {
  name: string
  description: string
  type: 'meal' | 'set'
  products: Array<{
    productId: string
    quantity: number
  }>
}

export const Route = createFileRoute('/templates/create')({
  component: CreateTemplate,
})

function CreateTemplate() {
  const navigate = useNavigate()
  const products = useQuery(api.products.getProducts) || []
  const createTemplate = useMutation(api.templates.createTemplate)

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

  const onSubmit = async (data: TemplateFormData) => {
    // Manual validation
    if (!data.name.trim()) {
      toast.error('Nazwa szablonu jest wymagana')
      return
    }

    if (!data.description.trim()) {
      toast.error('Opis szablonu jest wymagany')
      return
    }

    if (data.products.length === 0) {
      toast.error('Dodaj przynajmniej jeden produkt do szablonu')
      return
    }

    try {
      const productsWithValidData = data.products.filter(
        (product) => product.productId && product.quantity > 0,
      )

      if (productsWithValidData.length === 0) {
        toast.error('Wszystkie produkty muszą mieć poprawną nazwę i ilość')
        return
      }

      await createTemplate({
        name: data.name,
        description: data.description,
        type: data.type,
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

  return (
    <DialogLayout
      title="Nowy szablon"
      actions={
        <div className="flex justify-between items-center py-4">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/templates' })}
          >
            Anuluj
          </Button>
          <Button form="create-template-form" type="submit" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Utwórz szablon
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="create-template-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
