import { Router } from "express";
import {
  createOrder,
  createOrderOnBehalf,
  listOrders,
  getOrder,
  updateStatus,
  cancelOrder,
} from "./orders.controller";
import {
  createOrderSchema,
  createOrderForCustomerSchema,
  updateStatusSchema,
} from "./orders.schema";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

const router = Router();

router.use(authenticate);

// Customer self-checkout
router.post("/", authorize("CUSTOMER"), validate(createOrderSchema), createOrder);

// NEW: Admin places an order on behalf of a customer (phone orders, walk-ins,
// resolving app issues for a customer). Admin-only.
router.post(
  "/on-behalf",
  authorize("ADMIN"),
  validate(createOrderForCustomerSchema),
  createOrderOnBehalf
);

// Listing is role-scoped inside the service (Customer sees only their own)
router.get("/", authorize("ADMIN", "KITCHEN", "CUSTOMER"), listOrders);
router.get("/:id", authorize("ADMIN", "KITCHEN", "CUSTOMER"), getOrder);

// Kitchen & Admin move orders through the pipeline
router.patch("/:id/status", authorize("ADMIN", "KITCHEN"), validate(updateStatusSchema), updateStatus);

// Customer can cancel their own pending order
router.patch("/:id/cancel", authorize("CUSTOMER"), cancelOrder);

export default router;
