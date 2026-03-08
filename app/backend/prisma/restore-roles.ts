import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreAdminRoles() {
  console.log('🛡️ Restaurando roles de administrador a los dueños de empresas...');

  // 1. Buscar el ID del rol Administrador maestro
  const adminRole = await prisma.role.findFirst({
    where: { name: 'Administrador', isSystem: true }
  });

  if (!adminRole) {
    console.error('❌ Error: No se encontró el rol de Administrador. Ejecuta npx prisma db seed primero.');
    return;
  }

  // 2. Buscar todos los dueños de empresas que no tienen rol
  const owners = await prisma.company.findMany({
    select: { ownerId: true }
  });

  const ownerIds = owners.map(o => o.ownerId);

  const updated = await prisma.user.updateMany({
    where: {
      id: { in: ownerIds },
      roleId: null
    },
    data: {
      roleId: adminRole.id
    }
  });

  console.log(`✅ Se ha restaurado el rol de Administrador a ${updated.count} dueños de empresas.`);
  
  // Por si acaso, también actualizamos a cualquier usuario que falte por nombre
  const adminUsers = await prisma.user.updateMany({
    where: {
      email: { contains: 'admin' },
      roleId: null
    },
    data: {
      roleId: adminRole.id
    }
  });
  
  if (adminUsers.count > 0) {
    console.log(`✅ Se ha asignado rol a ${adminUsers.count} usuarios adicionales por coincidencia de email.`);
  }
}

restoreAdminRoles()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
