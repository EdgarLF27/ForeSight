import { PrismaClient } from "@prisma/client";

export async function seedSystemData(prisma: PrismaClient) {
  console.log("Inyectando datos de sistema: roles y permisos predeterminados.");
  // 1. DEFINICIÓN DE PERMISOS
  const permissionsData = [
    {
      name: "tickets:create",
      description: "Crear nuevos tickets",
      module: "Tickets",
    },
    {
      name: "tickets:view_all",
      description: "Ver todos los tickets de la empresa",
      module: "Tickets",
    },
    {
      name: "tickets:edit_status",
      description: "Cambiar el estado de los tickets",
      module: "Tickets",
    },
    {
      name: "tickets:assign",
      description: "Asignar tickets a técnicos",
      module: "Tickets",
    },
    {
      name: "tickets:delete",
      description: "Eliminar tickets",
      module: "Tickets",
    },
    {
      name: "areas:manage",
      description: "Crear, editar y eliminar áreas",
      module: "Áreas",
    },
    { name: "areas:view", description: "Ver lista de áreas", module: "Áreas" },
    {
      name: "users:view",
      description: "Ver miembros del equipo",
      module: "Equipo",
    },
    {
      name: "users:edit",
      description: "Editar roles y áreas de miembros",
      module: "Equipo",
    },
    {
      name: "roles:manage",
      description: "Crear y personalizar roles",
      module: "Roles",
    },
    {
      name: "roles:view",
      description: "Ver roles disponibles",
      module: "Roles",
    },
    {
      name: "meetings:manage",
      description: "Gestionar agenda y reuniones",
      module: "Reuniones",
    },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description, module: p.module },
      create: p,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  // 2. CREACIÓN DE ROLES DE SISTEMA
  const rolesToCreate = [
    {
      id: "admin-id",
      name: "Administrador",
      description: "Acceso total a la gestión de la empresa",
      isSystem: true,
      permissions: allPermissions.map((p) => p.id),
    },
    {
      id: "tech-id",
      name: "Técnico",
      description: "Encargado de resolver incidencias",
      isSystem: true,
      permissions: allPermissions
        .filter(
          (p) =>
            p.name.startsWith("tickets:") || p.name.startsWith("meetings:"),
        )
        .map((p) => p.id),
    },
    {
      id: "emp-id",
      name: "Empleado",
      description: "Usuario que reporta incidencias",
      isSystem: true,
      permissions: allPermissions
        .filter((p) => p.name === "tickets:create" || p.name === "areas:view")
        .map((p) => p.id),
    },
  ];

  for (const r of rolesToCreate) {
    const { permissions, ...roleData } = r;
    await prisma.role.upsert({
      where: { id: r.id },
      update: {
        name: r.name,
        description: r.description,
        isSystem: true,
        permissions: {
          set: permissions.map((id) => ({ id })),
        },
      },
      create: {
        ...roleData,
        permissions: {
          connect: permissions.map((id) => ({ id })),
        },
      },
    });
  }
}
