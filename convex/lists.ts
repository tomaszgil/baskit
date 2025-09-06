import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

export const createList = mutation({
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
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new Error('User not found')

    const now = Date.now()
    return await ctx.db.insert('lists', {
      ...args,
      userId,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateList = mutation({
  args: {
    id: v.id('lists'),
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

    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    const list = await ctx.db.get(id)
    if (!list) throw new Error('List not found')
    if (list.userId !== userId) throw new Error('User not authorized')

    return await ctx.db.patch(id, {
      ...data,
      updatedAt: Date.now(),
    })
  },
})

export const deleteList = mutation({
  args: { id: v.id('lists') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    const list = await ctx.db.get(args.id)
    if (!list) throw new Error('List not found')
    if (list.userId !== userId) throw new Error('User not authorized')

    await ctx.db.delete(args.id)
  },
})

export const setItemChecked = mutation({
  args: {
    listId: v.id('lists'),
    productId: v.id('products'),
    checked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    const list = await ctx.db.get(args.listId)
    if (!list) throw new Error('List not found')
    if (list.userId !== userId) throw new Error('User not authorized')

    const newItems = [...list.items]
    const productIndex = newItems.findIndex(
      (item) => item.productId === args.productId,
    )
    if (productIndex === -1) throw new Error('Product not found')
    newItems[productIndex] = {
      ...newItems[productIndex],
      checked: args.checked,
    }

    await ctx.db.patch(args.listId, {
      items: newItems,
      updatedAt: Date.now(),
    })
  },
})

export const getLists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    return await ctx.db
      .query('lists')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()
  },
})

export const getListById = query({
  args: { id: v.id('lists') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    const list = await ctx.db.get(args.id)
    if (!list) throw new Error('List not found')
    if (list.userId !== userId) throw new Error('User not authorized')

    return await ctx.db
      .query('lists')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('_id'), args.id))
      .first()
  },
})
