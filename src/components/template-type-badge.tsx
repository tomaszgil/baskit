import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

type Type = 'meal' | 'set'

const getStatusLabel = (status: Type) => {
  switch (status) {
    case 'meal':
      return 'Posiłek'
    case 'set':
      return 'Zestaw'
    default:
      return status
  }
}

const getStatusColor = (status: Type) => {
  switch (status) {
    case 'meal':
      return 'bg-orange-100 text-orange-800'
    case 'set':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface TemplateTypeBadgeProps {
  status: Type
  className?: string
}

export function TemplateTypeBadge({
  status,
  className,
}: TemplateTypeBadgeProps) {
  return (
    <Badge className={cn(getStatusColor(status), className)}>
      {getStatusLabel(status)}
    </Badge>
  )
}
