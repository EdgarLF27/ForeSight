import { PrismaClient, UserRole, TicketStatus, TicketPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo company owner
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'admin@techsolutions.com',
      password: hashedPassword,
      name: 'Admin Tech Solutions',
      role: UserRole.EMPRESA,
    },
  });

  // Create demo company
  const company = await prisma.company.create({
    data: {
      name: 'Tech Solutions SA',
      description: 'Empresa de desarrollo de software',
      inviteCode: 'TECH01',
      ownerId: owner.id,
    },
  });

  // Update owner with company
  await prisma.user.update({
    where: { id: owner.id },
    data: { companyId: company.id },
  });

  // Create demo employee
  const employee = await prisma.user.create({
    data: {
      email: 'juan@techsolutions.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: UserRole.EMPLEADO,
      companyId: company.id,
    },
  });

  // Create demo tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Problema con el servidor de correo',
      description: 'Los correos no se están enviando desde esta mañana. Se necesita revisar urgentemente.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: 'Infraestructura',
      companyId: company.id,
      createdById: owner.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Solicitud de nuevo software',
      description: 'Necesito instalar VS Code en mi equipo para desarrollo.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      category: 'Software',
      companyId: company.id,
      createdById: owner.id,
      assignedToId: employee.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Actualización de antivirus',
      description: 'La licencia del antivirus vence esta semana.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      category: 'Seguridad',
      companyId: company.id,
      createdById: employee.id,
      assignedToId: owner.id,
    },
  });

  // Create demo comments
  await prisma.comment.create({
    data: {
      content: 'Voy a revisar el servidor ahora mismo.',
      ticketId: ticket1.id,
      userId: owner.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Gracias, quedo atento.',
      ticketId: ticket1.id,
      userId: employee.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔑 Demo accounts:');
  console.log('  Admin: admin@techsolutions.com / password123');
  console.log('  Employee: juan@techsolutions.com / password123');
  console.log('  Invite Code: TECH01');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
