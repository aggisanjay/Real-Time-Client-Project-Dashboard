import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data in reverse order of dependencies
  await prisma.notification.deleteMany();
  await prisma.taskActivityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Arthur Pendelton (Admin)',
      email: 'admin@agency.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 2 Project Managers
  const pm1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor (PM)',
      email: 'sarah.pm@agency.com',
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Marcus Vance (PM)',
      email: 'marcus.pm@agency.com',
      passwordHash,
      role: Role.PROJECT_MANAGER,
    },
  });

  // 4 Developers
  const dev1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Dev)',
      email: 'alex.dev@agency.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Dev)',
      email: 'elena.dev@agency.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Liam Chen (Dev)',
      email: 'liam.dev@agency.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Maya Patel (Dev)',
      email: 'maya.dev@agency.com',
      passwordHash,
      role: Role.DEVELOPER,
    },
  });

  console.log('✅ Seeded 1 Admin, 2 PMs, 4 Developers');

  // 2. Create Clients
  const clientAlpha = await prisma.client.create({
    data: {
      name: 'Apex Global Logistics',
      contactInfo: 'ops@apexlogistics.com | +1 (555) 019-2831',
    },
  });

  const clientBeta = await prisma.client.create({
    data: {
      name: 'NovaPay Financial Services',
      contactInfo: 'partnerships@novapay.io | London, UK',
    },
  });

  const clientGamma = await prisma.client.create({
    data: {
      name: 'Aetheria Health Systems',
      contactInfo: 'director@aetheriahealth.org | Boston, MA',
    },
  });

  console.log('✅ Seeded 3 Clients');

  // 3. Create 3 Projects (managed by PMs)
  const proj1 = await prisma.project.create({
    data: {
      name: 'Fleet Real-Time Telemetry Tracking Platform',
      clientId: clientAlpha.id,
      managerId: pm1.id,
    },
  });

  const proj2 = await prisma.project.create({
    data: {
      name: 'High-Frequency Cross-Border Payment Engine',
      clientId: clientBeta.id,
      managerId: pm1.id,
    },
  });

  const proj3 = await prisma.project.create({
    data: {
      name: 'HIPAA Compliant Patient Telehealth Portal',
      clientId: clientGamma.id,
      managerId: pm2.id,
    },
  });

  console.log('✅ Seeded 3 Projects');

  const now = new Date();
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const past5Days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const future2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const future5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const future10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  // 4. Create Tasks (>= 5 tasks per project, all 4 statuses, >= 2 overdue)
  // Project 1 Tasks
  const t1_1 = await prisma.task.create({
    data: {
      projectId: proj1.id,
      title: 'Architect MQTT ingestion pipeline for GPS beacons',
      description: 'Design and deploy scalable Kafka/MQTT broker clustering.',
      assignedToId: dev1.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: past5Days,
      isOverdue: false,
    },
  });

  const t1_2 = await prisma.task.create({
    data: {
      projectId: proj1.id,
      title: 'Implement Leaflet geospatial map clustering widget',
      description: 'Support 50,000 concurrent ping markers with WebGL acceleration.',
      assignedToId: dev2.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: future2Days,
      isOverdue: false,
    },
  });

  const t1_3 = await prisma.task.create({
    data: {
      projectId: proj1.id,
      title: 'Fix driver idle alert false-positive threshold',
      description: 'Threshold algorithm triggers alerts prematurely in heavy urban traffic.',
      assignedToId: dev1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: past3Days, // Overdue task #1
      isOverdue: true,
    },
  });

  const t1_4 = await prisma.task.create({
    data: {
      projectId: proj1.id,
      title: 'Write automated E2E tests for route recalculation',
      description: 'Validate turn-by-turn re-routing when traffic blockage event occurs.',
      assignedToId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: future5Days,
      isOverdue: false,
    },
  });

  const t1_5 = await prisma.task.create({
    data: {
      projectId: proj1.id,
      title: 'Design exportable PDF dispatch audit report',
      description: 'Format daily fuel efficiency and driver route performance summaries.',
      assignedToId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: future10Days,
      isOverdue: false,
    },
  });

  // Project 2 Tasks
  const t2_1 = await prisma.task.create({
    data: {
      projectId: proj2.id,
      title: 'Integrate SWIFT gpi webhook validation signatures',
      description: 'Validate HMAC SHA-256 signatures on inbound transaction status callbacks.',
      assignedToId: dev2.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.URGENT,
      dueDate: past3Days,
      isOverdue: false,
    },
  });

  const t2_2 = await prisma.task.create({
    data: {
      projectId: proj2.id,
      title: 'Audit ISO 20022 XML parsing schema compliance',
      description: 'Fix namespace deserialization edge cases for multi-currency settlements.',
      assignedToId: dev3.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: future2Days,
      isOverdue: false,
    },
  });

  const t2_3 = await prisma.task.create({
    data: {
      projectId: proj2.id,
      title: 'Implement idempotency key cache with Redis cluster',
      description: 'Prevent double debit charges under network retry storms.',
      assignedToId: dev2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: past5Days, // Overdue task #2
      isOverdue: true,
    },
  });

  const t2_4 = await prisma.task.create({
    data: {
      projectId: proj2.id,
      title: 'Build currency FX spread calculation engine',
      description: 'Fetch real-time FX ticks and compute client-tiered spread percentages.',
      assignedToId: dev1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: future5Days,
      isOverdue: false,
    },
  });

  const t2_5 = await prisma.task.create({
    data: {
      projectId: proj2.id,
      title: 'Benchmark latency on merchant disbursement queue',
      description: 'Target sub-50ms roundtrip dispatch for SEPA Instant batches.',
      assignedToId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: future10Days,
      isOverdue: false,
    },
  });

  // Project 3 Tasks
  const t3_1 = await prisma.task.create({
    data: {
      projectId: proj3.id,
      title: 'Implement WebRTC peer connection renegotiation for video visits',
      description: 'Gracefully fall back to TURN servers on strict clinical hospital firewalls.',
      assignedToId: dev4.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: past5Days,
      isOverdue: false,
    },
  });

  const t3_2 = await prisma.task.create({
    data: {
      projectId: proj3.id,
      title: 'Enforce AES-256 encryption at rest for patient clinical notes',
      description: 'Envelope encryption with KMS key rotation every 90 days.',
      assignedToId: dev3.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.URGENT,
      dueDate: future2Days,
      isOverdue: false,
    },
  });

  const t3_3 = await prisma.task.create({
    data: {
      projectId: proj3.id,
      title: 'Integrate FHIR R4 Patient resource mapping endpoint',
      description: 'Normalize HL7 v2 ADT feeds into clean FHIR patient schemas.',
      assignedToId: dev4.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: future5Days,
      isOverdue: false,
    },
  });

  const t3_4 = await prisma.task.create({
    data: {
      projectId: proj3.id,
      title: 'Build digital prescription signature canvas pad',
      description: 'DEA EPCS compliant 2FA confirmation before issuing controlled substances.',
      assignedToId: dev1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: future5Days,
      isOverdue: false,
    },
  });

  const t3_5 = await prisma.task.create({
    data: {
      projectId: proj3.id,
      title: 'Design appointment reminder SMS/Email template engine',
      description: 'Support multi-language translation and timezone auto-detection.',
      assignedToId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: future10Days,
      isOverdue: false,
    },
  });

  console.log('✅ Seeded 15 Tasks across 3 Projects (including 2 Overdue)');

  // 5. Pre-populate TaskActivityLog rows so feed isn't empty on first load
  await prisma.taskActivityLog.createMany({
    data: [
      {
        taskId: t1_1.id,
        userId: dev1.id,
        fromStatus: TaskStatus.TODO,
        toStatus: TaskStatus.IN_PROGRESS,
        timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
      {
        taskId: t1_1.id,
        userId: dev1.id,
        fromStatus: TaskStatus.IN_PROGRESS,
        toStatus: TaskStatus.IN_REVIEW,
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        taskId: t1_1.id,
        userId: pm1.id,
        fromStatus: TaskStatus.IN_REVIEW,
        toStatus: TaskStatus.DONE,
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        taskId: t1_2.id,
        userId: dev2.id,
        fromStatus: TaskStatus.TODO,
        toStatus: TaskStatus.IN_PROGRESS,
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        taskId: t1_2.id,
        userId: dev2.id,
        fromStatus: TaskStatus.IN_PROGRESS,
        toStatus: TaskStatus.IN_REVIEW,
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        taskId: t2_1.id,
        userId: dev2.id,
        fromStatus: TaskStatus.IN_REVIEW,
        toStatus: TaskStatus.DONE,
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        taskId: t3_2.id,
        userId: dev3.id,
        fromStatus: TaskStatus.IN_PROGRESS,
        toStatus: TaskStatus.IN_REVIEW,
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        taskId: t1_3.id,
        userId: dev1.id,
        fromStatus: TaskStatus.TODO,
        toStatus: TaskStatus.IN_PROGRESS,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Seeded pre-existing TaskActivityLog records');

  // 6. Seed sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: pm1.id,
        type: 'TASK_IN_REVIEW',
        message: 'Elena Rostova moved "Implement Leaflet geospatial map clustering widget" to In Review',
        isRead: false,
        relatedTaskId: t1_2.id,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: dev1.id,
        type: 'TASK_ASSIGNED',
        message: 'You have been assigned to "Fix driver idle alert false-positive threshold"',
        isRead: true,
        relatedTaskId: t1_3.id,
        createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      },
      {
        userId: pm2.id,
        type: 'TASK_IN_REVIEW',
        message: 'Liam Chen moved "Enforce AES-256 encryption at rest for patient clinical notes" to In Review',
        isRead: false,
        relatedTaskId: t3_2.id,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Seeded initial Notifications');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
