import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAll() {
  console.log("🧹 Wiping all farm operational records...");
  const expenses = await prisma.dailyExpense.deleteMany();
  console.log(`Deleted ${expenses.count} DailyExpense records.`);

  const pesticides = await prisma.pesticideLog.deleteMany();
  console.log(`Deleted ${pesticides.count} PesticideLog records.`);

  const waters = await prisma.waterLog.deleteMany();
  console.log(`Deleted ${waters.count} WaterLog records.`);

  const fields = await prisma.field.deleteMany();
  console.log(`Deleted ${fields.count} Field (crops & plots) records.`);

  console.log("✨ All values reset to ZERO and all previous crops removed successfully!");
}

clearAll()
  .catch((e) => {
    console.error("Error resetting database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
