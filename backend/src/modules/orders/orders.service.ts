import { prisma } from "../../config/db";
import { OrderStatus, Role } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

type CartItemInput = { menuItemId: string; quantity: number };

// Valid forward-moving status transitions. Enforced server-side so neither
// role can skip steps (e.g. Kitchen jumping straight to COMPLETED) or
// resurrect a cancelled order.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

async function buildOrderItems(cartItems: CartItemInput[]) {
  const menuItemIds = cartItems.map((c) => c.menuItemId);
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });

  if (menuItems.length !== menuItemIds.length) {
    throw new AppError("One or more menu items no longer exist.", 400);
  }

  const unavailable = menuItems.filter((m) => !m.isAvailable);
  if (unavailable.length > 0) {
    throw new AppError(`These items are currently unavailable: ${unavailable.map((m) => m.name).join(", ")}`, 400);
  }

  const orderItemsData = cartItems.map((cartItem) => {
    const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId)!;
    return {
      menuItemId: menuItem.id,
      quantity: cartItem.quantity,
      priceEach: menuItem.price,
    };
  });

  const totalPrice = orderItemsData.reduce(
    (sum, item) => sum + Number(item.priceEach) * item.quantity,
    0
  );

  return { orderItemsData, totalPrice };
}

/** Customer self-checkout */
export async function createOrder(customerId: string, items: CartItemInput[], notes?: string) {
  const { orderItemsData, totalPrice } = await buildOrderItems(items);

  return prisma.order.create({
    data: {
      customerId,
      totalPrice,
      notes,
      placedViaAdmin: false,
      items: { create: orderItemsData },
    },
    include: { items: { include: { menuItem: true } }, customer: true },
  });
}

/**
 * Admin places an order on behalf of a customer (phone order, walk-in,
 * resolving an issue with a customer's account, etc). The order still
 * belongs to that customer (customerId), but we record who actually
 * placed it (placedByStaffId) for accountability/audit purposes.
 */
export async function createOrderForCustomer(
  adminId: string,
  customerId: string,
  items: CartItemInput[],
  notes?: string
) {
  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== Role.CUSTOMER) {
    throw new AppError("Selected customer account was not found.", 404);
  }

  const { orderItemsData, totalPrice } = await buildOrderItems(items);

  return prisma.order.create({
    data: {
      customerId,
      placedByStaffId: adminId,
      placedViaAdmin: true,
      totalPrice,
      notes,
      items: { create: orderItemsData },
    },
    include: { items: { include: { menuItem: true } }, customer: true, placedByStaff: true },
  });
}

/** Role-scoped order listing: Customers see only their own orders. */
export async function listOrders(user: { id: string; role: Role }, status?: OrderStatus) {
  const where =
    user.role === Role.CUSTOMER
      ? { customerId: user.id, ...(status ? { status } : {}) }
      : { ...(status ? { status } : {}) };

  return prisma.order.findMany({
    where,
    include: {
      items: { include: { menuItem: true } },
      customer: { select: { id: true, name: true, email: true } },
      placedByStaff: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string, user: { id: string; role: Role }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { menuItem: true } },
      customer: { select: { id: true, name: true, email: true } },
      placedByStaff: { select: { id: true, name: true } },
    },
  });

  if (!order) throw new AppError("Order not found.", 404);

  // A customer may only view their own order, regardless of who placed it
  if (user.role === Role.CUSTOMER && order.customerId !== user.id) {
    throw new AppError("You do not have permission to view this order.", 403);
  }

  return order;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, actorRole: Role) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found.", 404);

  const allowedNext = ALLOWED_TRANSITIONS[order.status];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Cannot move order from '${order.status}' to '${newStatus}'.`,
      400
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { items: { include: { menuItem: true } }, customer: { select: { id: true, name: true } } },
  });
}

export async function cancelOwnOrder(orderId: string, customerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found.", 404);
  if (order.customerId !== customerId) {
    throw new AppError("You can only cancel your own orders.", 403);
  }
  if (order.status !== OrderStatus.PENDING) {
    throw new AppError("Only pending orders can be cancelled.", 400);
  }

  return prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.CANCELLED } });
}
