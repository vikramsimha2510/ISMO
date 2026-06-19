import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateTaskInput, UpdateTaskInput, TaskQuery } from './tasks.schema.js';
import { mapDbToTaskStatus, mapDbToTaskPriority } from './tasks.schema.js';

/**
 * Verify that a user is a member of the given project.
 * Throws 404 if not a member.
 */
async function assertProjectMembership(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) {
    throw new AppError('Project not found', 404);
  }
  return membership;
}

/**
 * Format a task for API response, resolving the creator name.
 */
function formatTask(task: any) {
  return {
    ...task,
    status: mapDbToTaskStatus(task.status),
    priority: mapDbToTaskPriority(task.priority),
    createdByName: task.createdByUser?.fullName ?? null,
    createdByUser: undefined, // strip the relation object
  };
}

export const tasksService = {
  /**
   * List tasks. If projectId is provided, verify membership and list that project's tasks.
   * Otherwise, list tasks across all projects the user is a member of.
   */
  async getAll(userId: string, query: TaskQuery) {
    const { projectId, search, status, priority, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (projectId) {
      // Verify the user is a member of this specific project
      await assertProjectMembership(projectId, userId);
      where.projectId = projectId;
    } else {
      // Get all projects the user is a member of
      const memberships = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      const projectIds = memberships.map((m) => m.projectId);
      where.projectId = { in: projectIds };
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const data = tasks.map((t) => ({
      ...t,
      status: mapDbToTaskStatus(t.status),
      priority: mapDbToTaskPriority(t.priority),
      createdByName: t.user?.fullName ?? null,
      user: undefined, // strip the relation object
    }));

    return { data, total, page, limit };
  },

  /**
   * Get a single task by ID — verify the user is a member of its project.
   */
  async getById(id: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true } },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Verify membership on the task's project
    await assertProjectMembership(task.projectId, userId);

    return {
      ...task,
      status: mapDbToTaskStatus(task.status),
      priority: mapDbToTaskPriority(task.priority),
      createdByName: task.user?.fullName ?? null,
      user: undefined,
    };
  },

  /**
   * Create a new task. Verifies the user is a member of the target project.
   * Records createdByUserId for attribution.
   */
  async create(userId: string, data: CreateTaskInput) {
    await assertProjectMembership(data.projectId, userId);

    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        createdByUserId: userId,
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: 'created task',
        target: task.name,
      },
    });

    return {
      ...task,
      status: mapDbToTaskStatus(task.status),
      priority: mapDbToTaskPriority(task.priority),
    };
  },

  /**
   * Update a task — verify the user is a member of the task's project.
   */
  async update(id: string, userId: string, data: UpdateTaskInput) {
    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    await assertProjectMembership(existing.projectId, userId);

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    let action = 'updated task';
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      action = 'completed task';
    }

    await prisma.activity.create({
      data: {
        userId,
        action,
        target: updated.name,
      },
    });

    return {
      ...updated,
      status: mapDbToTaskStatus(updated.status),
      priority: mapDbToTaskPriority(updated.priority),
    };
  },

  /**
   * Delete a task — verify the user is a member of the task's project.
   */
  async remove(id: string, userId: string) {
    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    await assertProjectMembership(existing.projectId, userId);

    await prisma.$transaction([
      prisma.activity.create({
        data: {
          userId,
          action: 'deleted task',
          target: existing.name,
        },
      }),
      prisma.task.delete({ where: { id } }),
    ]);
  },
};
