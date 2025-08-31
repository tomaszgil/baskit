import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useMutation } from 'convex/react'
import { useEffect } from 'react'

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
import { ArrowLeft, Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface TemplateFormData {
  name: string
  description: string
  type: 'meal' | 'template'
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

  const template = useQuery(api.products.getTemplateById, {
    id: templateId as Id<'templates'>,
  })
  const products = useQuery(api.products.getAllProducts) || []
  const updateTemplate = useMutation(api.products.updateTemplate)

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
    }
  }, [template, form])

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

      toast.success('Szablon został zaktualizowany pomyślnie!')
      navigate({ to: '/templates' })
    } catch (error) {
      console.error('Błąd podczas aktualizacji szablonu:', error)
      toast.error('Wystąpił błąd podczas aktualizacji szablonu')
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
            <h1 className="text-xl font-semibold">Edytuj szablon</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="meal">Posiłek</SelectItem>
                          <SelectItem value="template">Szablon</SelectItem>
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
                  <FormLabel className="text-lg font-medium">
                    Produkty
                  </FormLabel>
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
            <Button onClick={form.handleSubmit(onSubmit)} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
