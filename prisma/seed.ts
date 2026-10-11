import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";
import { AppError } from "../src/errors/AppError";

async function main() {
  console.log("Start seeding roles...");

  // Seed roles
  const roles = ["Owner", "Manager", "Staff", "Kitchen"];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  console.log("Roles initiated");

  // Fetch the owner role ID
  const ownerRole = await prisma.role.findUniqueOrThrow({
    where: { name: "Owner" },
  });

  // create the first owner account
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    throw new AppError(400, "Invalid email or password");
  }
  const ownerPassword = process.env.OWNER_PASSWORD;

  if (!ownerPassword) {
    throw new AppError(400, "Invlaid email or password");
  }

  const hashedPassword = await hashPassword(ownerPassword);

  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      passwordHash: hashedPassword,
      roleId: ownerRole.id,
    },
  });

  console.log(`Owner account created: ${ownerEmail}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
