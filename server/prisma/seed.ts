import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const SEED_USER = {
  email: 'demo@ismo.app',
  password: 'demo1234',
  fullName: 'Demo Engineer',
};

async function main() {
  console.log('🌱 Seeding database…');

  // 1. Create (or find) the auth user
  let userId: string;

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === SEED_USER.email);

  if (existing) {
    console.log(`  ✓ Auth user already exists: ${existing.id}`);
    userId = existing.id;
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: SEED_USER.email,
      password: SEED_USER.password,
      email_confirm: true,
      user_metadata: { fullName: SEED_USER.fullName },
    });

    if (error) {
      console.error('  ✗ Failed to create auth user:', error.message);
      process.exit(1);
    }

    userId = data.user.id;
    console.log(`  ✓ Created auth user: ${userId}`);
  }

  // 2. Upsert the profile
  await prisma.profile.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      fullName: SEED_USER.fullName,
    },
  });
  console.log('  ✓ Profile upserted');

  // 3. Seed projects
  const projects = [
    {
      name: 'MEDISYNC AI',
      description:
        'Healthcare data synchronization platform using machine learning for predictive patient outcomes.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-08-15'),
    },
    {
      name: 'Linework Platform V2',
      description:
        'Next-generation project management SaaS overhaul with AI insights and enterprise features.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-10-30'),
    },
    {
      name: 'Smart Inventory System',
      description:
        'IoT-enabled warehouse inventory tracking and automated supply chain routing.',
      status: ProjectStatus.COMPLETED,
      startDate: new Date('2025-05-15'),
      endDate: new Date('2026-03-20'),
    },
    {
      name: 'College ERP Solution',
      description:
        'Unified university management portal for student records, grading, and faculty administration.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-01-15'),
    },
    {
      name: 'Customer Analytics Dashboard',
      description:
        'Real-time telemetry and user behavior analytics dashboard for B2B clients.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-07-30'),
    },
  ];

  for (const proj of projects) {
    const existing = await prisma.project.findFirst({
      where: { name: proj.name, userId },
    });

    if (existing) {
      console.log(`  ⏭ Project "${proj.name}" already exists — skipping`);
      continue;
    }

    const created = await prisma.project.create({
      data: { ...proj, userId },
    });

    // Create sample tasks for each project
    const taskNames = [
      'Architecture Design',
      'Core Implementation',
      'API Integration',
      'Unit Testing',
      'Code Review',
      'Performance Optimization',
      'Documentation',
      'Deployment Setup',
      'QA Testing',
      'Final Review',
    ];

    const priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];
    const statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];

    for (let i = 0; i < taskNames.length; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 10);

      await prisma.task.create({
        data: {
          name: `${taskNames[i]} — ${proj.name}`,
          description: `Detailed specification and execution for ${taskNames[i].toLowerCase()}.`,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: i < 4 ? TaskStatus.COMPLETED : statuses[Math.floor(Math.random() * 2)],
          dueDate,
          projectId: created.id,
          userId,
        },
      });
    }

    console.log(`  ✓ Created project "${proj.name}" with 10 tasks`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`\n📧 Demo account: ${SEED_USER.email} / ${SEED_USER.password}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
