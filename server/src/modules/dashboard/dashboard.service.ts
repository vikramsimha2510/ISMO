import { prisma } from '../../config/prisma.js';
import { ProjectStatus, TaskStatus } from '@prisma/client';

/**
 * Dashboard service — aggregates project/task stats for the authenticated user.
 *
 * Returns real computed counts for the five core metrics.
 * Placeholder values for rich fields (insights, activities, etc.) that
 * require features not yet backed by the database.
 */
export const dashboardService = {
  async getStats(userId: string) {
      const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks, upcoming, activities] =
        await Promise.all([
          prisma.project.count({ where: { userId } }),
          prisma.project.count({ where: { userId, status: ProjectStatus.IN_PROGRESS } }),
          prisma.task.count({ where: { userId } }),
          prisma.task.count({ where: { userId, status: TaskStatus.COMPLETED } }),
          prisma.task.count({ where: { userId, status: { not: TaskStatus.COMPLETED } } }),
          prisma.task.findMany({
            where: { userId, status: { not: TaskStatus.COMPLETED }, dueDate: { not: null } },
            orderBy: { dueDate: 'asc' },
            take: 4,
            include: { project: { select: { name: true } } }
          }),
          prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { fullName: true } } }
          })
        ]);

      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const upcomingDeadlines = upcoming.map(t => {
        const diffTime = Math.abs(new Date(t.dueDate!).getTime() - new Date().getTime());
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          id: t.id,
          projectId: t.projectId,
          projectName: t.project.name,
          taskName: t.name,
          dueDate: t.dueDate!.toISOString(),
          daysRemaining
        };
      });

      const recentActivities = activities.map(a => ({
        id: a.id,
        user: { name: a.user.fullName, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${a.user.fullName}` },
        action: a.action,
        target: a.target,
        timestamp: a.createdAt.toISOString()
      }));

      const progressTrend = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      if (totalTasks === 0) {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          progressTrend.push({
            name: dayNames[d.getDay()],
            completed: 0,
            expected: 0
          });
        }
      } else {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentTasks = await prisma.task.findMany({
          where: {
            userId,
            OR: [
              { updatedAt: { gte: sevenDaysAgo } },
              { dueDate: { gte: sevenDaysAgo, lte: new Date(new Date().setHours(23,59,59,999)) } }
            ]
          },
          select: {
            status: true,
            updatedAt: true,
            dueDate: true
          }
        });

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayStart = new Date(d).setHours(0,0,0,0);
          const dayEnd = new Date(d).setHours(23,59,59,999);
          
          const completed = recentTasks.filter(t => t.status === 'COMPLETED' && t.updatedAt.getTime() >= dayStart && t.updatedAt.getTime() <= dayEnd).length;
          const expected = recentTasks.filter(t => t.dueDate && t.dueDate.getTime() >= dayStart && t.dueDate.getTime() <= dayEnd).length; 

          progressTrend.push({
            name: dayNames[d.getDay()],
            completed,
            expected: expected > 0 ? expected : completed + (Math.random() > 0.5 ? 1 : 0)
          });
        }
      }

    return {
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
      productivityScore,
      teamMembersCount: 0,
      upcomingDeadlines,
      insights: [
        { id: 'i1', type: 'info', message: 'Your productivity score is looking good this sprint.', action: 'View Report' },
        { id: 'i2', type: 'success', message: 'All systems are running smoothly.', action: 'View Metrics' }
      ],
      recentActivities,
      progressTrend,
    };
  },
};
