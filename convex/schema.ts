import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    name: v.string(),
    unit: v.union(v.literal('ml'), v.literal('g'), v.literal('piece')),
  }),
})
