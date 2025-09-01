import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Id } from '~/convex/_generated/dataModel'

interface ShoppingContextValue {
  currentListId: Id<'shoppingLists'> | null
  startShopping: (listId: Id<'shoppingLists'>) => void
  stopShopping: () => void
}

const ShoppingContext = createContext<ShoppingContextValue | undefined>(
  undefined,
)

interface ShoppingProviderProps {
  children: React.ReactNode
}

const STORAGE_KEY = 'shopping.currentListId'

export function ShoppingProvider({ children }: ShoppingProviderProps) {
  const [currentListId, setCurrentListId] =
    useState<Id<'shoppingLists'> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCurrentListId(saved as Id<'shoppingLists'>)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      if (currentListId) {
        localStorage.setItem(STORAGE_KEY, currentListId)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore
    }
  }, [currentListId])

  const value = useMemo<ShoppingContextValue>(
    () => ({
      currentListId,
      startShopping: (listId) => setCurrentListId(listId),
      stopShopping: () => setCurrentListId(null),
    }),
    [currentListId],
  )

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  )
}

export function useShopping(): ShoppingContextValue {
  const ctx = useContext(ShoppingContext)
  if (!ctx) {
    throw new Error('useShopping must be used within ShoppingProvider')
  }
  return ctx
}
