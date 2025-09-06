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
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'ready':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
  }
}

interface ListStatusBadgeProps {
  status: Status
  className?: string
}

export function ListStatusBadge({ status, className }: ListStatusBadgeProps) {
  return (
    <Badge className={cn(getStatusColor(status), className)}>
      {getStatusLabel(status)}
    </Badge>
  )
}
