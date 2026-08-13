import { Response, NextFunction } from "express";
import * as ordersService from "./orders.service";
import { logAction } from "../../utils/audit";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { getIO } from "../../sockets";
import { OrderStatus } from "@prisma/client";

export async function createOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { items, notes } = req.body;
    const order = await ordersService.createOrder(req.user!.id, items, notes);

    await logAction(req.user!.id, "ORDER_PLACED", {
      orderId: order.id,
      totalPrice: order.totalPrice,
    });

    getIO()?.to("kitchen").emit("order:new", order);

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function createOrderOnBehalf(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { customerId, items, notes } = req.body;
    const order = await ordersService.createOrderForCustomer(
      req.user!.id,
      customerId,
      items,
      notes,
    );

    await logAction(req.user!.id, "ORDER_PLACED_BY_ADMIN", {
      orderId: order.id,
      customerId,
      totalPrice: order.totalPrice,
    });

    getIO()?.to("kitchen").emit("order:new", order);
    getIO()?.to(`customer:${customerId}`).emit("order:new", order);

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const status = req.query.status as OrderStatus | undefined;
    const orders = await ordersService.listOrders(req.user!, status);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await ordersService.getOrderById(req.params.id, req.user!);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(
      req.params.id,
      status,
      req.user!.role,
    );

    await logAction(req.user!.id, "ORDER_STATUS_UPDATED", {
      orderId: order.id,
      newStatus: status,
    });

    getIO()?.to("kitchen").emit("order:statusUpdate", order);
    getIO()
      ?.to(`customer:${order.customerId}`)
      .emit("order:statusUpdate", order);

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await ordersService.cancelOwnOrder(
      req.params.id,
      req.user!.id,
    );

    await logAction(req.user!.id, "ORDER_CANCELLED", { orderId: order.id });

    getIO()?.to("kitchen").emit("order:cancelled", order);

    res.json({ order });
  } catch (err) {
    next(err);
  }
}
