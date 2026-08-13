import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@foodapp.com" },
    update: {},
    create: {
      name: "Restaurant Admin",
      email: "admin@foodapp.com",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: "kitchen@foodapp.com" },
    update: {},
    create: {
      name: "Kitchen Staff",
      email: "kitchen@foodapp.com",
      password: passwordHash,
      role: Role.KITCHEN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { phone: "9999999999" },
    update: {},
    create: {
      name: "Test Customer",
      phone: "9999999999",
      role: Role.CUSTOMER,
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "Main Course" },
    update: {},
    create: { name: "Main Course" },
  });

  const starters = await prisma.category.upsert({
    where: { name: "Starters" },
    update: {},
    create: { name: "Starters" },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: "Paneer Butter Masala",
        description: "Cottage cheese in a rich tomato-butter gravy",
        price: 220,
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
        categoryId: category.id,
      },
      {
        name: "Veg Biryani",
        description: "Fragrant basmati rice with mixed vegetables and spices",
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c",
        categoryId: category.id,
      },
      {
        name: "Spring Rolls",
        description: "Crispy rolls stuffed with veggies",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1548811256-1627d99b7e33",
        categoryId: starters.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete:");
  console.log({ admin: admin.email, kitchen: kitchen.email });
  console.log("Staff password: Password@123");
  console.log({ customer: customer.phone, note: "Customer logs in with phone + OTP (see console when OTP is requested)." });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
