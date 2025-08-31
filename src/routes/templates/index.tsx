import { createFileRoute } from '@tanstack/react-router'
import { TemplateManager } from '@/components/template-manager'

export const Route = createFileRoute('/templates/')({
  component: Templates,
})

function Templates() {
  return (
    <div className="space-y-4">
      <TemplateManager />
    </div>
  )
}
