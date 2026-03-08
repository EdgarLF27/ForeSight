import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function hardClean() {
  console.log('🔥 Iniciando limpieza profunda de roles...');

  // 1. Desvincular usuarios de roles de sistema temporalmente para evitar errores de integridad
  await prisma.user.updateMany({
    where: { role: { isSystem: true } },
    data: { roleId: null }
  });
  console.log('  - Usuarios desvinculados de roles de sistema.');

  // 2. Eliminar todos los roles de sistema
  const deleted = await prisma.role.deleteMany({
    where: { isSystem: true }
  });
  console.log(`  - Se eliminaron ${deleted.count} roles de sistema duplicados.`);

  console.log('✅ Base de datos lista para un seed limpio.');
}

hardClean()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
