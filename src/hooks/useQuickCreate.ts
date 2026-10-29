import { useEffect } from 'react'

/** Route-scoped listener for the shared header's Create action. */
export function useQuickCreate(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const open = () => setOpen(true)
    window.addEventListener('open-quick-create', open)
    return () => window.removeEventListener('open-quick-create', open)
  }, [setOpen])
}
