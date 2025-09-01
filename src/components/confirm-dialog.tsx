'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  actionLabel?: string
  cancelLabel?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  actionLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface UseConfirmDialogOptions {
  title: string
  description: string
  actionLabel?: string
  cancelLabel?: string
}

export function useConfirmDialog(
  actionFn: () => void | Promise<void>,
  options: UseConfirmDialogOptions,
) {
  const [open, setOpen] = React.useState(false)

  const openDialog = React.useCallback(() => {
    setOpen(true)
  }, [])

  const handleConfirm = React.useCallback(async () => {
    try {
      await actionFn()
    } catch (error) {
      console.error('Error in confirm dialog action:', error)
    }
  }, [actionFn])

  const ConfirmDialogComponent = React.useMemo(
    () => (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={options.title}
        description={options.description}
        onConfirm={handleConfirm}
        actionLabel={options.actionLabel}
        cancelLabel={options.cancelLabel}
      />
    ),
    [
      open,
      options.title,
      options.description,
      options.actionLabel,
      options.cancelLabel,
      handleConfirm,
    ],
  )

  return {
    openDialog,
    ConfirmDialog: ConfirmDialogComponent,
  }
}
