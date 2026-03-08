import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// IDs fijos para roles de sistema para evitar duplicados
const ADMIN_ROLE_ID = 'system-admin-role-fixed';
const EMPLOYEE_ROLE_ID = 'system-employee-role-fixed';
const TECHNICIAN_ROLE_ID = 'system-technician-role-fixed';

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create System Permissions
  const permissionsData = [
    { name: 'roles:view', module: 'roles', description: 'Ver roles' },
    { name: 'roles:create', module: 'roles', description: 'Crear roles' },
    { name: 'roles:edit', module: 'roles', description: 'Editar roles' },
    { name: 'roles:delete', module: 'roles', description: 'Eliminar roles' },
    { name: 'tickets:view', module: 'tickets', description: 'Ver tickets' },
    { name: 'tickets:create', module: 'tickets', description: 'Crear tickets' },
    { name: 'tickets:edit', module: 'tickets', description: 'Editar tickets' },
    { name: 'tickets:delete', module: 'tickets', description: 'Eliminar tickets' },
    { name: 'tickets:assign', module: 'tickets', description: 'Asignar tickets' },
    { name: 'tickets:claim', module: 'tickets', description: 'Reclamar tickets' },
    { name: 'users:view', module: 'users', description: 'Ver usuarios' },
    { name: 'users:edit', module: 'users', description: 'Editar usuarios' },
  ];

  const permissions = [];
  for (const p of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
    permissions.push(permission);
  }

  // 2. Create System Roles (Base) con IDs fijos
  const adminRole = await prisma.role.upsert({
    where: { id: ADMIN_ROLE_ID },
    update: {
      name: 'Administrador',
      isSystem: true,
      permissions: {
        set: permissions.map(p => ({ id: p.id })),
      },
    },
    create: {
      id: ADMIN_ROLE_ID,
      name: 'Administrador',
      description: 'Acceso total al sistema',
      isSystem: true,
      permissions: {
        connect: permissions.map(p => ({ id: p.id })),
      },
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { id: EMPLOYEE_ROLE_ID },
    update: {
      name: 'Empleado',
      isSystem: true,
      permissions: {
        set: permissions.filter(p => p.name.startsWith('tickets:') && p.name !== 'tickets:delete' && p.name !== 'tickets:claim').map(p => ({ id: p.id })),
      },
    },
    create: {
      id: EMPLOYEE_ROLE_ID,
      name: 'Empleado',
      description: 'Acceso limitado a tickets propios',
      isSystem: true,
      permissions: {
        connect: permissions.filter(p => p.name.startsWith('tickets:') && p.name !== 'tickets:delete' && p.name !== 'tickets:claim').map(p => ({ id: p.id })),
      },
    },
  });

  const technicianRole = await prisma.role.upsert({
    where: { id: TECHNICIAN_ROLE_ID },
    update: {
      name: 'Técnico',
      isSystem: true,
      permissions: {
        set: permissions.filter(p => 
          (p.name.startsWith('tickets:') && p.name !== 'tickets:delete' && p.name !== 'tickets:create') || 
          p.name === 'users:view'
        ).map(p => ({ id: p.id })),
      },
    },
    create: {
      id: TECHNICIAN_ROLE_ID,
      name: 'Técnico',
      description: 'Puede ver y reclamar tickets abiertos',
      isSystem: true,
      permissions: {
        connect: permissions.filter(p => 
          (p.name.startsWith('tickets:') && p.name !== 'tickets:delete' && p.name !== 'tickets:create') || 
          p.name === 'users:view'
        ).map(p => ({ id: p.id })),
      },
    },
  });

  // 3. Create demo company owner
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'admin@techsolutions.com' },
    update: { roleId: adminRole.id },
    create: {
      email: 'admin@techsolutions.com',
      password: hashedPassword,
      name: 'Admin Tech Solutions',
      roleId: adminRole.id,
    },
  });

  // 4. Create demo company
  let company = await prisma.company.findUnique({ where: { inviteCode: 'TECH01' } });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Tech Solutions SA',
        description: 'Empresa de desarrollo de software',
        inviteCode: 'TECH01',
        ownerId: owner.id,
      },
    });
  }

  // Update users with companyId
  await prisma.user.update({
    where: { id: owner.id },
    data: { companyId: company.id },
  });

  // Create demo employee
  await prisma.user.upsert({
    where: { email: 'juan@techsolutions.com' },
    update: { roleId: employeeRole.id, companyId: company.id },
    create: {
      email: 'juan@techsolutions.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      roleId: employeeRole.id,
      companyId: company.id,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
