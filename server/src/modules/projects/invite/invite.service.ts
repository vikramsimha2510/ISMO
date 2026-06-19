import { prisma } from '../../../config/prisma.js';
import { AppError } from '../../../utils/AppError.js';
import { projectsService } from '../projects.service.js';
import { mapDbToStatus } from '../projects.schema.js';

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

export const inviteService = {
  /**
   * Join a project using an invite code.
   */
  async joinProject(userId: string, inviteCode: string) {
    // Find the project by invite code
    const project = await prisma.project.findUnique({
      where: { inviteCode },
    });

    if (!project) {
      throw new AppError('Invalid invite code', 404);
    }

    if (!project.inviteEnabled) {
      throw new AppError('Invitations for this project are currently disabled', 403);
    }

    // Check if user is already a member
    const existingMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: project.id, userId } },
    });

    if (existingMembership) {
      throw new AppError('You are already a member of this project', 409);
    }

    // Insert membership
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'MEMBER',
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        action: 'joined project',
        target: project.name,
      },
    });

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: mapDbToStatus(project.status),
      },
    };
  },

  /**
   * Regenerate the invite code for a project. OWNER only.
   */
  async regenerateInvite(projectId: string, userId: string) {
    await projectsService.findOwnedProjectOrFail(projectId, userId);

    const newCode = generateInviteCode();
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { inviteCode: newCode },
      select: { inviteCode: true, inviteEnabled: true },
    });

    return updated;
  },

  /**
   * Toggle invite enabled/disabled for a project. OWNER only.
   */
  async toggleInvite(projectId: string, userId: string) {
    await projectsService.findOwnedProjectOrFail(projectId, userId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { inviteEnabled: true },
    });

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { inviteEnabled: !project!.inviteEnabled },
      select: { inviteCode: true, inviteEnabled: true },
    });

    return updated;
  },
};
