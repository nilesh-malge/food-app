import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/config/db";

const app = createApp();

describe("RBAC enforcement", () => {
  let customerCookie: string[];
  let adminCookie: string[];
  let categoryId: string;

  const uniqueSuffix = Date.now();
  const customerPhone = `9${String(uniqueSuffix).slice(-9)}`;
  const adminEmail = `admin${uniqueSuffix}@test.com`;

  beforeAll(async () => {
    const custRes = await request(app).post("/api/auth/customer-login").send({
      phone: customerPhone,
      name: "Test Customer",
    });
    customerCookie = custRes.headers["set-cookie"] as unknown as string[];

    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash("Password@123", 10);
    await prisma.user.create({
      data: {
        name: "Test Admin",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
      },
    });
    const adminRes = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password: "Password@123",
    });
    adminCookie = adminRes.headers["set-cookie"] as unknown as string[];

    const category = await prisma.category.create({
      data: { name: `TestCategory${uniqueSuffix}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("blocks a CUSTOMER from creating a menu item", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Cookie", customerCookie)
      .send({ name: "Hack Item", price: 10, categoryId });
    expect(res.status).toBe(403);
  });

  it("allows an ADMIN to create a menu item", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Cookie", adminCookie)
      .send({ name: "Admin Item", price: 99, categoryId });
    expect(res.status).toBe(201);
    expect(res.body.item.name).toBe("Admin Item");
  });

  it("rejects unauthenticated requests to protected routes", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("blocks a CUSTOMER from placing an order on behalf of another customer", async () => {
    const res = await request(app)
      .post("/api/orders/on-behalf")
      .set("Cookie", customerCookie)
      .send({ customerId: "some-id", items: [] });
    expect(res.status).toBe(403);
  });

  it("lets a returning customer sign in with just their phone (no name needed)", async () => {
    const res = await request(app)
      .post("/api/auth/customer-login")
      .send({ phone: customerPhone });
    expect(res.status).toBe(200);
    expect(res.body.user.phone).toBe(customerPhone);
  });

  it("rejects a brand-new phone number with no name provided", async () => {
    const newPhone = `9${String(uniqueSuffix + 1).slice(-9)}`;
    const res = await request(app)
      .post("/api/auth/customer-login")
      .send({ phone: newPhone });
    expect(res.status).toBe(400);
  });

  it("allows an ADMIN to place an order on behalf of a customer", async () => {
    const me = await request(app)
      .get("/api/auth/me")
      .set("Cookie", customerCookie);
    const customerId = me.body.user.id;

    const menuRes = await request(app)
      .post("/api/menu")
      .set("Cookie", adminCookie)
      .send({ name: "On-Behalf Item", price: 50, categoryId });
    const menuItemId = menuRes.body.item.id;

    const res = await request(app)
      .post("/api/orders/on-behalf")
      .set("Cookie", adminCookie)
      .send({
        customerId,
        items: [{ menuItemId, quantity: 2 }],
        notes: "Customer called in, app was down",
      });

    expect(res.status).toBe(201);
    expect(res.body.order.customerId).toBe(customerId);
    expect(res.body.order.placedViaAdmin).toBe(true);
    expect(Number(res.body.order.totalPrice)).toBe(100);
  });
});
