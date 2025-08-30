import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Search, Plus } from 'lucide-react'

import type { Id } from '../../convex/_generated/dataModel'

interface Product {
  _id: Id<'products'>
  name: string
  unit: 'ml' | 'g' | 'piece'
}

interface ProductSelectorProps {
  onProductAdd: (product: Product, quantity: number) => void
}

export function ProductSelector({ onProductAdd }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)

  const products = useQuery(api.products.getAllProducts) || []

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      onProductAdd(selectedProduct, quantity)
      setSelectedProduct(null)
      setQuantity(1)
      setSearchTerm('')
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj produkt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Szukaj produktu</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Wpisz nazwę produktu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchTerm && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                  selectedProduct?._id === product._id
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {getUnitLabel(product.unit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="space-y-2">
            <Label htmlFor="quantity">Ilość</Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {getUnitLabel(selectedProduct.unit)}
              </span>
            </div>

            <Button
              onClick={handleAddProduct}
              className="w-full"
              disabled={quantity <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj do listy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
