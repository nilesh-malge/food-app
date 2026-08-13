import { z } from "zod";

export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().uuid(),
    isAvailable: z.boolean().optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().uuid().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({ name: z.string().min(2) }),
});
