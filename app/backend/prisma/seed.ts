import { PrismaClient } from "@prisma/client";
import { seedSystemData } from "./seeds/roles.seed";
import { seedDevData } from "./seeds/demo.seed";
import { clearDatabase } from "./seeds/clear.seed";

const prisma = new PrismaClient();

async function main() {
  const arg = process.argv[2];
  console.log("Iniciando inyección de datos Default");

  if (arg === "--clear") {
    await clearDatabase(prisma);
  } else if (arg === "--roles") {
    await seedSystemData(prisma);
  } else if (arg === "--demo") {
    // Para demo, primero aseguramos que existan los roles
    await seedSystemData(prisma);
    await seedDevData(prisma);
  } else if (arg === "--full-reset") {
    // Limpia todo y vuelve a inyectar roles + demo
    await clearDatabase(prisma);
    await seedSystemData(prisma);
    await seedDevData(prisma);
  } else {
    // Por defecto: inyectar solo lo vital si no hay argumentos
    await seedSystemData(prisma);
  }

  console.log("Operación completada.");
}

main()
  .catch((e) => {
    console.error("Error fatal en el proceso:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
