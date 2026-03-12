import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Diagnostic: Testing Database Connectivity...');
  try {
    await prisma.$connect();
    console.log('✅ Connection established.');

    console.log('📦 Testing User table...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User count: ${userCount}`);
    } catch (e) {
      console.error('❌ User table test failed!');
      console.error(e.message);
    }

    console.log('📦 Testing Area table...');
    try {
      const areaCount = await prisma.area.count();
      console.log(`✅ Area count: ${areaCount}`);
    } catch (e) {
      console.error('❌ Area table test failed!');
      console.error(e.message);
    }

    console.log('📦 Testing Notification table...');
    try {
      const notificationCount = await prisma.notification.count();
      console.log(`✅ Notification count: ${notificationCount}`);
    } catch (e) {
      console.error('❌ Notification table test failed!');
      console.error(e.message);
    }

  } catch (error) {
    console.error('❌ Diagnostic failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
