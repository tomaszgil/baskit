import { createFileRoute } from '@tanstack/react-router'
import { ProductSelector } from '@/components/product-selector'

export const Route = createFileRoute('/products')({
  component: Products,
})

function Products() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Produkty</h2>
        <p className="text-muted-foreground">Dodawaj produkty do list</p>
      </div>
      <ProductSelector onProductAdd={() => {}} />
    </div>
  )
}
