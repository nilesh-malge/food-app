import { z } from "zod";
import { OrderStatus } from "@prisma/client";

const orderItemInput = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

// Used when a CUSTOMER checks out their own cart
export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemInput).min(1, "Order must contain at least one item"),
    notes: z.string().optional(),
  }),
});

// Used when an ADMIN places an order on behalf of a customer
// (e.g. phone-in order, walk-in with a POS-style flow, fixing a customer issue)
export const createOrderForCustomerSchema = z.object({
  body: z.object({
    customerId: z.string().uuid("A valid customer must be selected"),
    items: z.array(orderItemInput).min(1, "Order must contain at least one item"),
    notes: z.string().optional(),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.nativeEnum(OrderStatus) }),
});
