import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

type Status = 'draft' | 'ready' | 'completed'

const getStatusLabel = (status: Status) => {
  switch (status) {
    case 'draft':
      return 'Szkic'
    case 'ready':
      return 'Gotowa'
    case 'completed':
      return 'Ukończona'
    default:
      return status
  }
}

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'ready':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(getStatusColor(status), className)}>
      {getStatusLabel(status)}
    </Badge>
  )
}
