import { createFileRoute } from '@tanstack/react-router'
import { TemplateManager } from '@/components/template-manager'

export const Route = createFileRoute('/templates/')({
  component: Templates,
})

function Templates() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Szablony</h2>
        <p className="text-muted-foreground">Twórz szablony posiłków i list</p>
      </div>
      <TemplateManager />
    </div>
  )
}
