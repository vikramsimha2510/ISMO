import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateTaskInput, UpdateTaskInput, TaskQuery } from './tasks.schema.js';
import { mapDbToTaskStatus, mapDbToTaskPriority } from './tasks.schema.js';

export const tasksService = {
  // Hardcoded for UI rendering purposes
  FAKE_ASSIGNEE: { id: 'tm_1', name: 'Sarah Chen', role: 'Lead Architect', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah' },
  /**
   * List all tasks for the authenticated user, with optional filtering
   * (by projectId, search, status, priority) and pagination.
   */
  async getAll(userId: string, query: TaskQuery) {
    const { projectId, search, status, priority, page, limit } = query;
    const skip = (page - 1) * limit;

    // Always scope to the authenticated user
    const where: any = { userId };

    if (projectId) {
      where.projectId = projectId;
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
      }),
      prisma.task.count({ where }),
    ]);

    const data = tasks.map(t => ({
      ...t,
      status: mapDbToTaskStatus(t.status),
      priority: mapDbToTaskPriority(t.priority),
      assignee: tasksService.FAKE_ASSIGNEE
    }));

    return { data, total, page, limit };
  },

  /**
   * Get a single task by ID — only if the authenticated user owns it.
   */
  async getById(id: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return {
      ...task,
      status: mapDbToTaskStatus(task.status),
      priority: mapDbToTaskPriority(task.priority),
      assignee: tasksService.FAKE_ASSIGNEE
    };
  },

  /**
   * Create a new task.
   * Verifies that the referenced project belongs to the authenticated user
   * before creating the task.
   */
  async create(userId: string, data: CreateTaskInput) {
    // Verify the project belongs to this user
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        userId, // Store userId directly on the task for faster ownership queries
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
      assignee: tasksService.FAKE_ASSIGNEE
    };
  },

  /**
   * Update a task — only if the authenticated user owns it.
   */
  async update(id: string, userId: string, data: UpdateTaskInput) {
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Task not found', 404);
    }

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
      assignee: tasksService.FAKE_ASSIGNEE
    };
  },

  /**
   * Delete a task — only if the authenticated user owns it.
   */
  async remove(id: string, userId: string) {
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Task not found', 404);
    }

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
