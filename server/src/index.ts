import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { socketService } from './services/socketService.js';
import { startOverdueScheduler } from './services/cronService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);

// 1. Core Middleware
app.use(
  cors({
    origin: ENV.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// 4. Central Error Handler
app.use(errorHandler);

// 5. Initialize WebSockets & Background Schedulers
socketService.initialize(server);
startOverdueScheduler();

// 6. Connect Database & Start Server
async function start() {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
    console.log(`📡 WebSocket server mounted on port ${ENV.PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start();
} else {
  connectDB().catch(console.error);
}

export { app, server };
