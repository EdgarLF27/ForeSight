import { PrismaClient } from "@prisma/client";

export async function clearDatabase(prisma: PrismaClient) {
  console.log("Limpiando todos los registros de la base de datos");

  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' 
    AND tablename NOT LIKE '_prisma_migrations';
  `;

  for (const { tablename } of tablenames) {
    try {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
      );
    } catch (error) {
      console.error(`Error limpiando tabla ${tablename}:`, error);
    }
  }

  console.log("Base de datos vaciada (esquema preservado).");
}
