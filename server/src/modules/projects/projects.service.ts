import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateProjectInput, UpdateProjectInput, ProjectQuery } from './projects.schema.js';
import { mapDbToStatus } from './projects.schema.js';

export const projectsService = {
  // Hardcoded for UI rendering purposes since DB doesn't have these models yet
  FAKE_TEAM: [
    { id: 'tm_1', name: 'Sarah Chen', role: 'Lead Architect', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah' },
    { id: 'tm_2', name: 'Marcus Johnson', role: 'Senior Engineer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus' },
    { id: 'tm_3', name: 'Elena Rodriguez', role: 'Product Manager', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena' },
  ],
  /**
   * List all projects for the authenticated user, with optional search/status
   * filtering and pagination. Includes computed taskCount and completionPercentage.
   */
  async getAll(userId: string, query: ProjectQuery) {
    const { search, status, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build the WHERE clause — always scoped to the user
    const where: any = { userId };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Transform to include taskCount and completionPercentage
    const data = projects.map((p) => {
      const taskCount = p._count.tasks;
      // In the database, tasks use PENDING, IN_PROGRESS, COMPLETED
      // But we can check against 'COMPLETED' (from the DB)
      const completedTasks = p.tasks.filter((t) => t.status === 'COMPLETED').length;
      const completionPercentage =
        taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

      // Omit the raw tasks and _count from the response
      const { tasks: _tasks, _count, ...rest } = p;

      return {
        ...rest,
        status: mapDbToStatus(p.status),
        taskCount,
        completionPercentage,
        health: 'On Track',
        teamMembers: projectsService.FAKE_TEAM,
      };
    });

    return { data, total, page, limit };
  },

  /**
   * Get a single project by ID — only if the authenticated user owns it.
   */
  async getById(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const taskCount = project._count.tasks;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const completionPercentage =
      taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    const { tasks: _tasks, _count, ...rest } = project;

    return { 
      ...rest, 
      status: mapDbToStatus(project.status),
      taskCount, 
      completionPercentage,
      health: 'On Track',
      teamMembers: projectsService.FAKE_TEAM,
    };
  },

  /**
   * Create a new project owned by the authenticated user.
   */
  async create(userId: string, data: CreateProjectInput) {
    const project = await prisma.project.create({
      data: { ...data, userId },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: 'created project',
        target: project.name,
      },
    });

    return { 
      ...project, 
      status: mapDbToStatus(project.status),
      taskCount: 0, 
      completionPercentage: 0,
      health: 'On Track',
      teamMembers: projectsService.FAKE_TEAM,
    };
  },

  /**
   * Update a project — only if the authenticated user owns it.
   */
  async update(id: string, userId: string, data: UpdateProjectInput) {
    // Verify ownership first
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Project not found', 404);
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: 'updated project',
        target: updated.name,
      },
    });

    const taskCount = updated._count.tasks;
    const completedTasks = updated.tasks.filter((t) => t.status === 'COMPLETED').length;
    const completionPercentage =
      taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    const { tasks: _tasks, _count, ...rest } = updated;

    return { 
      ...rest, 
      status: mapDbToStatus(updated.status),
      taskCount, 
      completionPercentage,
      health: 'On Track',
      teamMembers: projectsService.FAKE_TEAM,
    };
  },

  /**
   * Delete a project — only if the authenticated user owns it.
   * Cascade deletes all associated tasks.
   */
  async remove(id: string, userId: string) {
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Project not found', 404);
    }

    await prisma.$transaction([
      prisma.activity.create({
        data: {
          userId,
          action: 'deleted project',
          target: existing.name,
        },
      }),
      prisma.project.delete({ where: { id } }),
    ]);
  },
};
