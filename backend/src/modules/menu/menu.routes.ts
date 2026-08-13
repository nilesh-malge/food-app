import { Router } from "express";
import {
  listMenu,
  createItem,
  updateItem,
  deleteItem,
  listCategories,
  createCategory,
} from "./menu.controller";
import { createMenuItemSchema, updateMenuItemSchema, createCategorySchema } from "./menu.schema";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

const router = Router();

router.use(authenticate);

// Viewable by every logged-in role (Admin, Kitchen, Customer)
router.get("/", listMenu);
router.get("/categories", listCategories);

// Mutations: Admin only
router.post("/", authorize("ADMIN"), validate(createMenuItemSchema), createItem);
router.patch("/:id", authorize("ADMIN"), validate(updateMenuItemSchema), updateItem);
router.delete("/:id", authorize("ADMIN"), deleteItem);
router.post("/categories", authorize("ADMIN"), validate(createCategorySchema), createCategory);

export default router;
