import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import react from '@/assets/react.svg'
import { Button } from '@/components/ui/button'
import { api } from '~/convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const products = useQuery(api.products.get)

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Button>Click me here</Button>

      <img src={react} alt="React Logo" />
      {products?.map(({ _id, name, unit }) => (
        <div key={_id}>
          {name} ({unit})
        </div>
      ))}
    </div>
  )
}
