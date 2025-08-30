import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ProductSelector } from './product-selector'
import { TemplateManager } from './template-manager'
import { ShoppingList } from './shopping-list'
import { ShoppingCart, FileText, Plus } from 'lucide-react'

type TabType = 'shopping' | 'templates' | 'products'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('shopping')

  const tabs = [
    {
      id: 'shopping' as TabType,
      label: 'Listy zakupów',
      icon: ShoppingCart,
      description: 'Twórz i zarządzaj listami zakupów',
    },
    {
      id: 'templates' as TabType,
      label: 'Szablony',
      icon: FileText,
      description: 'Twórz szablony posiłków i list',
    },
    {
      id: 'products' as TabType,
      label: 'Produkty',
      icon: Plus,
      description: 'Dodawaj produkty do list',
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shopping':
        return <ShoppingList />
      case 'templates':
        return <TemplateManager />
      case 'products':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Produkty</h2>
            </div>
            <ProductSelector onProductAdd={() => {}} />
          </div>
        )
      default:
        return <ShoppingList />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">Baskit</h1>
        <p className="text-center text-muted-foreground text-lg">
          Twórz listy zakupów szybko i łatwo
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-6 py-3"
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Button>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listy zakupów</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Aktywne listy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Szablony</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Zapisane szablony</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produkty</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">Dostępne produkty</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">{renderTabContent()}</div>
    </div>
  )
}
