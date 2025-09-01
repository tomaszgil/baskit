import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Id } from '~/convex/_generated/dataModel'

interface ShoppingState {
  currentListId: Id<'shoppingLists'> | null
  startShopping: (listId: Id<'shoppingLists'>) => void
  stopShopping: () => void
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      currentListId: null,
      startShopping: (listId) => set({ currentListId: listId }),
      stopShopping: () => set({ currentListId: null }),
    }),
    {
      name: 'shopping.currentListId',
      // Only persist the currentListId, not the functions
      partialize: (state) => ({ currentListId: state.currentListId }),
    },
  ),
)
