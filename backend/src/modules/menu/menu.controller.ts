import { Response, NextFunction } from "express";
import * as menuService from "./menu.service";
import { logAction } from "../../utils/audit";
import { AuthenticatedRequest } from "../../middleware/authenticate";

export async function listMenu(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { search, categoryId, page, pageSize } = req.query;
    // Customers only ever see available items; staff can see everything
    // (e.g. Admin managing the menu needs to see disabled items too).
    const onlyAvailable = req.user?.role === "CUSTOMER";

    const result = await menuService.getMenuItems({
      search: search as string,
      categoryId: categoryId as string,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      onlyAvailable,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const item = await menuService.createMenuItem(req.body);
    await logAction(req.user!.id, "MENU_ITEM_CREATED", { itemId: item.id, name: item.name });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    await logAction(req.user!.id, "MENU_ITEM_UPDATED", { itemId: item.id, changes: req.body });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await menuService.deleteMenuItem(req.params.id);
    await logAction(req.user!.id, "MENU_ITEM_DELETED", { itemId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const categories = await menuService.getCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const category = await menuService.createCategory(req.body.name);
    await logAction(req.user!.id, "CATEGORY_CREATED", { categoryId: category.id });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}
