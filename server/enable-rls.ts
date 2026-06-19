import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Enabling Row Level Security (RLS) on public tables...');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Activity" ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled on Activity table');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled on profiles table');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Project" ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled on Project table');
    
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Task" ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled on Task table');

    console.log('Done! All public tables now have RLS enabled.');
  } catch (error) {
    console.error('Error enabling RLS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
