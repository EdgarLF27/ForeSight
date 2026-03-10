import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const targetHash = '$2b$10$Q/k5T5.fWAjyZ.qmrc8uiu5OnKHFXYM9H2cJuRWeweov/AXnr45z2';
  const newPassword = '123456';

  console.log(`🔍 Buscando usuario con el hash perdido...`);

  // Buscamos el usuario que tenga exactamente ese hash
  const user = await prisma.user.findFirst({
    where: {
      password: targetHash,
    },
  });

  if (!user) {
    console.error('❌ No se encontró ningún usuario con ese hash de contraseña.');
    return;
  }

  console.log(`✅ Usuario encontrado: ${user.email} (${user.name})`);
  console.log(`🔄 Actualizando contraseña a "${newPassword}"...`);

  const salt = await bcrypt.genSalt();
  const newHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newHash,
    },
  });

  console.log('🎉 ¡Contraseña actualizada correctamente!');
  console.log(`👉 Ahora puedes iniciar sesión con: ${user.email} / ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
