import { Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { logAction } from "../../utils/audit";
import { AuthenticatedRequest } from "../../middleware/authenticate";

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const users = await usersService.listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function createStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, password, role } = req.body;
    const user = await usersService.createStaffUser(name, email, password, role);
    await logAction(req.user!.id, "STAFF_ACCOUNT_CREATED", { createdUserId: user.id, role });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function toggleActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await usersService.setUserActive(id, isActive);
    await logAction(req.user!.id, isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED", { targetUserId: id });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// Used by the Admin's "place order on behalf of a customer" screen
// to search/select which customer the order belongs to.
export async function searchCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string | undefined;
    const customers = await usersService.listCustomers(search);
    res.json({ customers });
  } catch (err) {
    next(err);
  }
}
