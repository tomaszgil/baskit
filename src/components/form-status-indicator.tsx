import { CheckCircle, AlertCircle } from 'lucide-react'

interface FormStatusIndicatorProps {
  status: 'idle' | 'saved' | 'failed'
}

export function FormStatusIndicator({ status }: FormStatusIndicatorProps) {
  switch (status) {
    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" /> Zapisano
        </div>
      )
    case 'failed':
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" /> Błąd zapisu
        </div>
      )
    case 'idle':
    default:
      return null
  }
}
