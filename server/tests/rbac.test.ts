import request from 'supertest';
import { app } from '../src/index.js';
import { prisma } from '../src/config/db.js';

describe('Server-Side Role-Based Access Control (RBAC) Verification', () => {
  let adminToken: string;
  let pm1Token: string;
  let pm2Token: string;
  let dev1Token: string;
  let dev2Token: string;

  let dev1Task: any;
  let dev2Task: any;
  let pm1Project: any;
  let pm2Project: any;

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@agency.com', password: 'Password123!' });
    adminToken = adminRes.body.accessToken;

    // 2. Authenticate PM1 (Sarah)
    const pm1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.pm@agency.com', password: 'Password123!' });
    pm1Token = pm1Res.body.accessToken;

    // 3. Authenticate PM2 (Marcus)
    const pm2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marcus.pm@agency.com', password: 'Password123!' });
    pm2Token = pm2Res.body.accessToken;

    // 4. Authenticate Dev1 (Alex)
    const dev1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.dev@agency.com', password: 'Password123!' });
    dev1Token = dev1Res.body.accessToken;

    // 5. Authenticate Dev2 (Elena)
    const dev2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'elena.dev@agency.com', password: 'Password123!' });
    dev2Token = dev2Res.body.accessToken;

    // Fetch test entity references directly from database
    const users = await prisma.user.findMany();
    const dev1User = users.find((u) => u.email === 'alex.dev@agency.com')!;
    const dev2User = users.find((u) => u.email === 'elena.dev@agency.com')!;
    const pm1User = users.find((u) => u.email === 'sarah.pm@agency.com')!;
    const pm2User = users.find((u) => u.email === 'marcus.pm@agency.com')!;

    dev1Task = await prisma.task.findFirst({
      where: { assignedToId: dev1User.id },
    });

    dev2Task = await prisma.task.findFirst({
      where: { assignedToId: dev2User.id },
    });

    pm1Project = await prisma.project.findFirst({
      where: { managerId: pm1User.id },
    });

    pm2Project = await prisma.project.findFirst({
      where: { managerId: pm2User.id },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Unauthenticated requests are rejected with 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Developer CANNOT fetch another developer\'s task directly by ID (blocked with 403 FORBIDDEN)', async () => {
    // Dev1 attempting to fetch Dev2's task
    const res = await request(app)
      .get(`/api/tasks/${dev2Task.id}`)
      .set('Authorization', `Bearer ${dev1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('Access denied');
  });

  test('Developer can view their own assigned task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${dev1Task.id}`)
      .set('Authorization', `Bearer ${dev1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.task.id).toBe(dev1Task.id);
  });

  test('Developer list query returns ONLY tasks assigned to them', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${dev1Token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    for (const t of res.body.tasks) {
      expect(t.assignedToId).toBe(dev1Task.assignedToId);
    }
  });

  test('Developer CANNOT create projects (blocked with 403 FORBIDDEN)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${dev1Token}`)
      .send({
        name: 'Unauthorized Developer Project',
        clientId: pm1Project.clientId,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('Developer CANNOT delete tasks (blocked with 403 FORBIDDEN)', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${dev1Task.id}`)
      .set('Authorization', `Bearer ${dev1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('Project Manager CANNOT access or view another PM\'s project (blocked with 403 FORBIDDEN)', async () => {
    // PM1 attempting to fetch PM2's project
    const res = await request(app)
      .get(`/api/projects/${pm2Project.id}`)
      .set('Authorization', `Bearer ${pm1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('Project Manager only sees their own managed projects in list query', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${pm1Token}`);

    expect(res.status).toBe(200);
    for (const p of res.body.projects) {
      expect(p.managerId).toBe(pm1Project.managerId);
    }
  });

  test('Admin has full global access across all projects and tasks', async () => {
    const projectsRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(projectsRes.status).toBe(200);
    expect(projectsRes.body.projects.length).toBeGreaterThanOrEqual(3);

    const tasksRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(tasksRes.status).toBe(200);
    expect(tasksRes.body.tasks.length).toBeGreaterThanOrEqual(15);
  });
});
