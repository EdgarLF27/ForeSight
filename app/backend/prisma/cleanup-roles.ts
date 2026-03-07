import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanRoles() {
  console.log('🧹 Iniciando limpieza de roles duplicados...');

  const systemRolesNames = ['Administrador', 'Empleado'];

  for (const name of systemRolesNames) {
    const roles = await prisma.role.findMany({
      where: { name, isSystem: true },
      orderBy: { createdAt: 'asc' }
    });

    if (roles.length > 1) {
      console.log(`Filtro: Encontrados ${roles.length} roles de sistema con el nombre "${name}"`);
      const [mainRole, ...duplicates] = roles;

      for (const duplicate of duplicates) {
        // Mover usuarios al rol principal
        const updatedUsers = await prisma.user.updateMany({
          where: { roleId: duplicate.id },
          data: { roleId: mainRole.id }
        });
        console.log(`  - Movidos ${updatedUsers.count} usuarios del rol duplicado ${duplicate.id} al principal ${mainRole.id}`);
        
        // Eliminar permisos asociados al duplicado (relación many-to-many)
        // Prisma maneja esto automáticamente al borrar el rol si la relación está configurada, 
        // pero por seguridad el delete lo limpia.
        
        await prisma.role.delete({ where: { id: duplicate.id } });
        console.log(`  - Rol duplicado ${duplicate.id} eliminado.`);
      }
    }
  }

  console.log('✅ Limpieza completada. Ahora tienes solo un Administrador y un Empleado de sistema.');
}

cleanRoles()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
