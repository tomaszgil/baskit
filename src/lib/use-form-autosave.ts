import { useMemo, useState, useRef, useEffect } from 'react'
import debounce from 'lodash/debounce'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

type SaveStatus = 'idle' | 'saved' | 'failed'

export const useFormAutosave = <Values extends FieldValues>(
  form: UseFormReturn<Values>,
  save: (data: Values) => Promise<any>,
) => {
  const saveFn = useRef(save)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Watch form values for changes
  const watchedValues = form.watch()

  // Create debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce(
        form.handleSubmit(async (data) => {
          try {
            await saveFn.current(data)
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 3000)
          } catch (error) {
            setSaveStatus('failed')
            throw error
          }
        }),
        1000,
      ),
    [save, form.handleSubmit],
  )

  // Auto-save when form values change and form is valid
  useEffect(() => {
    if (form.formState.isDirty) {
      debouncedSave()
    }
  }, [watchedValues, form.formState.isDirty, debouncedSave])

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  return saveStatus
}
