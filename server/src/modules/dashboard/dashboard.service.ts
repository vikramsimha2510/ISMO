import { prisma } from '../../config/prisma.js';
import { ProjectStatus, TaskStatus } from '@prisma/client';

/**
 * Dashboard service — aggregates project/task stats for the authenticated user.
 *
 * Now queries through ProjectMember to include projects the user has joined,
 * not just ones they own.
 */
export const dashboardService = {
  async getStats(userId: string) {
    // Get all project IDs the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    const projectFilter = { id: { in: projectIds } };
    const taskFilter = { projectId: { in: projectIds } };

    const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks, upcoming, activities, teamMembersCount] =
      await Promise.all([
        prisma.project.count({ where: projectFilter }),
        prisma.project.count({ where: { ...projectFilter, status: ProjectStatus.IN_PROGRESS } }),
        prisma.task.count({ where: taskFilter }),
        prisma.task.count({ where: { ...taskFilter, status: TaskStatus.COMPLETED } }),
        prisma.task.count({ where: { ...taskFilter, status: { not: TaskStatus.COMPLETED } } }),
        prisma.task.findMany({
          where: { ...taskFilter, status: { not: TaskStatus.COMPLETED }, dueDate: { not: null } },
          orderBy: { dueDate: 'asc' },
          take: 4,
          include: { project: { select: { name: true } } },
        }),
        prisma.activity.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { user: { select: { fullName: true } } },
        }),
        // Count distinct co-members across all the user's projects
        prisma.projectMember.groupBy({
          by: ['userId'],
          where: { projectId: { in: projectIds } },
        }).then((groups) => groups.length),
      ]);

    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const upcomingDeadlines = upcoming.map((t) => {
      const diffTime = Math.abs(new Date(t.dueDate!).getTime() - new Date().getTime());
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        id: t.id,
        projectId: t.projectId,
        projectName: t.project.name,
        taskName: t.name,
        dueDate: t.dueDate!.toISOString(),
        daysRemaining,
      };
    });

    const recentActivities = activities.map((a) => ({
      id: a.id,
      user: { name: a.user.fullName, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${a.user.fullName}` },
      action: a.action,
      target: a.target,
      timestamp: a.createdAt.toISOString(),
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
          expected: 0,
        });
      }
    } else {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const recentTasks = await prisma.task.findMany({
        where: {
          ...taskFilter,
          OR: [
            { updatedAt: { gte: sevenDaysAgo } },
            { dueDate: { gte: sevenDaysAgo, lte: new Date(new Date().setHours(23, 59, 59, 999)) } },
          ],
        },
        select: {
          status: true,
          updatedAt: true,
          dueDate: true,
        },
      });

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d).setHours(0, 0, 0, 0);
        const dayEnd = new Date(d).setHours(23, 59, 59, 999);

        const completed = recentTasks.filter(
          (t) => t.status === 'COMPLETED' && t.updatedAt.getTime() >= dayStart && t.updatedAt.getTime() <= dayEnd,
        ).length;
        const expected = recentTasks.filter(
          (t) => t.dueDate && t.dueDate.getTime() >= dayStart && t.dueDate.getTime() <= dayEnd,
        ).length;

        progressTrend.push({
          name: dayNames[d.getDay()],
          completed,
          expected: expected > 0 ? expected : completed + (Math.random() > 0.5 ? 1 : 0),
        });
      }
    }

    const insights = [];
    
    // Insight 1: Productivity
    if (totalTasks === 0) {
      insights.push({ id: 'i1', type: 'info', message: 'You have no tasks yet. Create some to get started!', action: 'Create Task' });
    } else if (productivityScore >= 75) {
      insights.push({ id: 'i1', type: 'success', message: 'Excellent progress! Your productivity score is very high.', action: 'View Report' });
    } else if (productivityScore >= 50) {
      insights.push({ id: 'i1', type: 'info', message: 'Your productivity score is looking good this sprint.', action: 'View Report' });
    } else {
      insights.push({ id: 'i1', type: 'warning', message: 'Productivity is below 50%. Might need to focus on completing tasks.', action: 'View Tasks' });
    }

    // Insight 2: Deadlines or System Health
    const criticalDeadlines = upcomingDeadlines.filter(d => d.daysRemaining <= 3);
    if (criticalDeadlines.length > 0) {
      insights.push({ id: 'i2', type: 'warning', message: `You have ${criticalDeadlines.length} critical deadline(s) approaching within 3 days.`, action: 'View Deadlines' });
    } else if (pendingTasks > 0) {
      insights.push({ id: 'i2', type: 'info', message: `You have ${pendingTasks} pending tasks to tackle.`, action: 'View Tasks' });
    } else {
      insights.push({ id: 'i2', type: 'success', message: 'All systems are running smoothly. No immediate tasks pending.', action: 'View Metrics' });
    }

    return {
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
      productivityScore,
      teamMembersCount,
      upcomingDeadlines,
      insights,
      recentActivities,
      progressTrend,
    };
  },
};
