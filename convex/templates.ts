import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

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
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new Error('User not found')

    const now = Date.now()
    return await ctx.db.insert('templates', {
      ...args,
      userId,
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

    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    const template = await ctx.db.get(id)
    if (!template) throw new Error('Template not found')
    if (template.userId !== userId) throw new Error('User not authorized')

    return await ctx.db.patch(id, {
      ...data,
      updatedAt: Date.now(),
    })
  },
})

export const deleteTemplate = mutation({
  args: { id: v.id('templates') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('User not found')

    const template = await ctx.db.get(args.id)
    if (!template) throw new Error('Template not found')
    if (template.userId !== userId) throw new Error('User not authorized')

    return await ctx.db.delete(args.id)
  },
})

export const getTemplates = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new Error('User not found')

    return await ctx.db
      .query('templates')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()
  },
})

export const getTemplateById = query({
  args: { id: v.id('templates') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new Error('User not found')

    return await ctx.db
      .query('templates')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('_id'), args.id))
      .first()
  },
})
