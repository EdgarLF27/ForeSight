import { PrismaClient, TicketStatus, TicketPriority } from "@prisma/client";
import * as bcrypt from "bcrypt";

export async function seedDevData(prisma: PrismaClient) {
  console.log(
    "Solo datos Demo: creando usuario admin, empresa de prueba, áreas y un ticket.",
  );
  // 1. Crear Usuario Admin de Prueba
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      id: "demo-admin-id",
      email: "admin@demo.com",
      password: hashedPassword,
      name: "Admin Demo",
      roleId: "admin-id", // Referencia al rol de sistema
    },
  });

  // 2. Crear Empresa de Prueba
  const company = await prisma.company.upsert({
    where: { inviteCode: "DEMO12" },
    update: {},
    create: {
      id: "demo-company-id",
      name: "Demo Corp",
      description: "Empresa para pruebas de desarrollo",
      inviteCode: "DEMO12",
      ownerId: adminUser.id,
    },
  });

  // Vincular admin a la empresa
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { companyId: company.id },
  });

  // 3. Crear Áreas de ejemplo
  const areas = ["Soporte Técnico", "Recursos Humanos", "Mantenimiento"];
  const createdAreas = [];

  for (const areaName of areas) {
    const area = await prisma.area.create({
      data: {
        name: areaName,
        description: `Área de ${areaName}`,
        companyId: company.id,
      },
    });
    createdAreas.push(area);
  }

  // 4. Crear un Ticket de prueba
  await prisma.ticket.create({
    data: {
      title: "Problema con el servidor",
      description: "No podemos acceder a la base de datos de producción.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
      companyId: company.id,
      createdById: adminUser.id,
      areaId: createdAreas[0].id,
    },
  });

  console.log("Datos de desarrollo inyectados correctamente.");
  console.log("Admin: admin@demo.com / admin123");
  console.log("Código Invite: DEMO12");
}
