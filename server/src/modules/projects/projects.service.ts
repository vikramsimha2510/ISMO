import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateProjectInput, UpdateProjectInput, ProjectQuery } from './projects.schema.js';
import { mapDbToStatus } from './projects.schema.js';
import type { MemberRole } from '@prisma/client';

/**
 * Generate an 8-character alphanumeric invite code.
 * Avoids ambiguous characters (O, 0, I, 1).
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const projectsService = {
  /**
   * Check if a user has ANY membership (OWNER or MEMBER) for a project.
   * Returns the project and the user's role.
   */
  async findAccessibleProjectOrFail(projectId: string, userId: string) {
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true } },
            tasks: { select: { status: true } },
          },
        },
      },
    });

    if (!membership) {
      throw new AppError('Project not found', 404);
    }

    return { project: membership.project, role: membership.role };
  },

  /**
   * Check if a user is the OWNER of a project. Returns the project.
   */
  async findOwnedProjectOrFail(projectId: string, userId: string) {
    const { project, role } = await projectsService.findAccessibleProjectOrFail(projectId, userId);
    if (role !== 'OWNER') {
      throw new AppError('Project not found', 404);
    }
    return project;
  },

  /**
   * Format a project for API response with computed fields.
   */
  formatProject(project: any, role?: MemberRole) {
    const taskCount = project._count?.tasks ?? 0;
    const completedTasks = project.tasks
      ? project.tasks.filter((t: any) => t.status === 'COMPLETED').length
      : 0;
    const completionPercentage =
      taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    const { tasks: _tasks, _count, members: _members, ...rest } = project;

    return {
      ...rest,
      status: mapDbToStatus(project.status),
      taskCount,
      completionPercentage,
      health: 'On Track',
      ...(role ? { role } : {}),
    };
  },

  /**
   * List all projects the authenticated user is a member of,
   * with optional search/status filtering and pagination.
   */
  async getAll(userId: string, query: ProjectQuery) {
    const { search, status, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build project-level WHERE clause
    const projectWhere: any = {};
    if (search) {
      projectWhere.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      projectWhere.status = status;
    }

    // Query through memberships
    const [memberships, total] = await Promise.all([
      prisma.projectMember.findMany({
        where: {
          userId,
          project: projectWhere,
        },
        skip,
        take: limit,
        orderBy: { project: { createdAt: 'desc' } },
        include: {
          project: {
            include: {
              _count: { select: { tasks: true } },
              tasks: { select: { status: true } },
              members: {
                include: { user: { select: { id: true, fullName: true } } },
                take: 5,
              },
            },
          },
        },
      }),
      prisma.projectMember.count({
        where: {
          userId,
          project: projectWhere,
        },
      }),
    ]);

    const data = memberships.map((m) => {
      const formatted = projectsService.formatProject(m.project, m.role);
      // Attach real team member previews
      const teamMembers = m.project.members?.map((member: any) => ({
        id: member.userId,
        name: member.user.fullName,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${member.user.fullName}`,
        role: member.role,
      })) ?? [];
      return { ...formatted, teamMembers };
    });

    return { data, total, page, limit };
  },

  /**
   * Get a single project by ID — only if the user is a member.
   */
  async getById(id: string, userId: string) {
    const { project, role } = await projectsService.findAccessibleProjectOrFail(id, userId);
    return projectsService.formatProject(project, role);
  },

  /**
   * Create a new project owned by the authenticated user.
   * Uses a transaction to create both the project and the OWNER membership.
   */
  async create(userId: string, data: CreateProjectInput) {
    const inviteCode = generateInviteCode();

    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          ...data,
          userId,
          inviteCode,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId,
          role: 'OWNER',
        },
      });

      await tx.activity.create({
        data: {
          userId,
          action: 'created project',
          target: newProject.name,
        },
      });

      return newProject;
    });

    return {
      ...project,
      status: mapDbToStatus(project.status),
      taskCount: 0,
      completionPercentage: 0,
      health: 'On Track',
      role: 'OWNER' as const,
      teamMembers: [{
        id: userId,
        name: 'You',
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=You`,
        role: 'OWNER',
      }],
    };
  },

  /**
   * Update a project — only the OWNER can do this.
   */
  async update(id: string, userId: string, data: UpdateProjectInput) {
    await projectsService.findOwnedProjectOrFail(id, userId);

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

    return projectsService.formatProject(updated, 'OWNER');
  },

  /**
   * Delete a project — only the OWNER can do this.
   * Cascade deletes all associated tasks and memberships.
   */
  async remove(id: string, userId: string) {
    const existing = await projectsService.findOwnedProjectOrFail(id, userId);

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
