import { Button } from './button'
import { Plus } from 'lucide-react'
import { Card } from './card'
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip'

interface FABProps {
  onClick: () => void
  label: string
  className?: string
}

export function FAB({ onClick, label }: FABProps) {
  return (
    <div className="fixed right-0 bottom-24 w-full">
      <div className="flex justify-end container mx-auto max-w-lg px-4">
        <Card className="absolute p-0 shadow-lg -translate-y-full">
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={onClick}
                size="icon"
                aria-label={label}
                className="size-12"
              >
                <Plus className="size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{label}</TooltipContent>
          </Tooltip>
        </Card>
      </div>
    </div>
  )
}
