import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Product mutations
export const createProduct = mutation({
  args: {
    name: v.string(),
    unit: v.union(v.literal('ml'), v.literal('g'), v.literal('piece')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('products', args)
  },
})

// Product queries
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('products').collect()
  },
})

export const getProductById = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Template mutations
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal('meal'), v.literal('template')),
    products: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('templates', {
      ...args,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateTemplate = mutation({
  args: {
    id: v.id('templates'),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal('meal'), v.literal('template')),
    products: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args
    return await ctx.db.patch(id, {
      ...data,
      updatedAt: Date.now(),
    })
  },
})

export const deleteTemplate = mutation({
  args: { id: v.id('templates') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// Template queries
export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('templates').collect()
  },
})

export const getTemplateById = query({
  args: { id: v.id('templates') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Shopping list mutations
export const createShoppingList = mutation({
  args: {
    name: v.string(),
    items: v.array(
      v.object({
        productId: v.id('products'),
        quantity: v.number(),
        notes: v.optional(v.string()),
        checked: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('shoppingLists', {
      ...args,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateShoppingList = mutation({
  args: {
    id: v.id('shoppingLists'),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('draft'), v.literal('ready'), v.literal('completed')),
    ),
    items: v.optional(
      v.array(
        v.object({
          productId: v.id('products'),
          quantity: v.number(),
          notes: v.optional(v.string()),
          checked: v.boolean(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args
    return await ctx.db.patch(id, {
      ...data,
      updatedAt: Date.now(),
    })
  },
})

export const deleteShoppingList = mutation({
  args: { id: v.id('shoppingLists') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

export const toggleItemChecked = mutation({
  args: {
    listId: v.id('shoppingLists'),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId)
    if (!list) throw new Error('List not found')

    const newItems = [...list.items]
    newItems[args.itemIndex] = {
      ...newItems[args.itemIndex],
      checked: !newItems[args.itemIndex].checked,
    }

    await ctx.db.patch(args.listId, {
      items: newItems,
      updatedAt: Date.now(),
    })
  },
})

// Shopping list queries
export const getAllShoppingLists = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('shoppingLists').collect()
  },
})

export const getShoppingListById = query({
  args: { id: v.id('shoppingLists') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getShoppingList = query({
  args: { id: v.id('shoppingLists') },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.id)
    if (!list) return null

    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      list.items.map(async (item) => {
        const product = await ctx.db.get(item.productId)
        return {
          ...item,
          product: product || null,
        }
      }),
    )

    return {
      ...list,
      items: itemsWithProducts,
    }
  },
})

export const getShoppingListsByStatus = query({
  args: {
    status: v.union(
      v.literal('draft'),
      v.literal('ready'),
      v.literal('completed'),
    ),
  },
  handler: async (ctx, args) => {
    const allLists = await ctx.db.query('shoppingLists').collect()
    return allLists.filter((list) => list.status === args.status)
  },
})

// Helper function to create list from template
export const createListFromTemplate = mutation({
  args: {
    templateId: v.id('templates'),
    multiplier: v.number(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId)
    if (!template) throw new Error('Template not found')

    const items = template.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity * args.multiplier,
      notes: '',
      checked: false,
    }))

    const now = Date.now()
    return await ctx.db.insert('shoppingLists', {
      name: args.name,
      status: 'draft',
      items,
      createdAt: now,
      updatedAt: now,
    })
  },
})
