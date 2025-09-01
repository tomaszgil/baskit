import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Baskit</h1>
        <p className="text-muted-foreground">
          Twórz listy zakupów szybko i łatwo
        </p>
      </div>
    </div>
  )
}
