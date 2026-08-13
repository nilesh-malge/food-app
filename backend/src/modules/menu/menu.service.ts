import { prisma } from "../../config/db";

interface MenuQuery {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  onlyAvailable?: boolean;
}

export async function getMenuItems(q: MenuQuery) {
  const page = q.page && q.page > 0 ? q.page : 1;
  const pageSize = q.pageSize && q.pageSize > 0 ? q.pageSize : 12;

  const where = {
    ...(q.search ? { name: { contains: q.search, mode: "insensitive" as const } } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.onlyAvailable ? { isAvailable: true } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.menuItem.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function createMenuItem(data: any) {
  return prisma.menuItem.create({ data });
}

export function updateMenuItem(id: string, data: any) {
  return prisma.menuItem.update({ where: { id }, data });
}

export function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function createCategory(name: string) {
  return prisma.category.create({ data: { name } });
}
