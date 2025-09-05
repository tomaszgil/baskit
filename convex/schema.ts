import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,

  products: defineTable({
    name: v.string(),
    unit: v.union(v.literal('ml'), v.literal('g'), v.literal('piece')),
  }),

  templates: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal('meal'), v.literal('template')),
    products: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  shoppingLists: defineTable({
    userId: v.id('users'),
    name: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('ready'),
      v.literal('completed'),
    ),
    items: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
        notes: v.optional(v.string()),
        checked: v.boolean(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),
})
