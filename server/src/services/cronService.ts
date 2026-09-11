import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { TaskStatus } from '@prisma/client';

export function startOverdueScheduler(): cron.ScheduledTask {
  console.log('⏰ Initializing Overdue Task Scheduler (Runs every 10 minutes)...');

  // Run every 10 minutes: "*/10 * * * *"
  const task = cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      
      const result = await prisma.task.updateMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            not: TaskStatus.DONE,
          },
          isOverdue: false,
        },
        data: {
          isOverdue: true,
        },
      });

      if (result.count > 0) {
        console.log(`[Cron Scheduler] Flagged ${result.count} tasks as overdue.`);
      }
    } catch (error) {
      console.error('[Cron Scheduler] Failed to evaluate overdue tasks:', error);
    }
  });

  // Run once immediately upon server startup to ensure data consistency
  (async () => {
    try {
      const now = new Date();
      const initialRun = await prisma.task.updateMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            not: TaskStatus.DONE,
          },
          isOverdue: false,
        },
        data: {
          isOverdue: true,
        },
      });
      if (initialRun.count > 0) {
        console.log(`[Cron Scheduler] Startup check: Marked ${initialRun.count} tasks as overdue.`);
      }
    } catch (err) {
      console.error('[Cron Scheduler] Startup overdue check failed:', err);
    }
  })();

  return task;
}
