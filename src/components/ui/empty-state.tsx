import type { ReactNode } from 'react'

interface EmptyStateProps {
  illustration: ReactNode
  title: ReactNode
  description: ReactNode
  action: ReactNode
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6 text-muted-foreground">{illustration}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  )
}
