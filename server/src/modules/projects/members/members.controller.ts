import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { prisma } from '../../../config/prisma.js';
import { AppError } from '../../../utils/AppError.js';
import { projectsService } from '../projects.service.js';
import { env } from '../../../config/env.js';

export const membersController = {
  /**
   * GET /api/projects/:id/members
   * Any member can see the member list.
   * Only OWNERs get invite code/link in the response.
   */
  getMembers: asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id as string;
    const userId = req.user!.id;

    const { role } = await projectsService.findAccessibleProjectOrFail(projectId, userId);

    const memberRows = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, fullName: true } },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    const members = memberRows.map((m) => ({
      userId: m.userId,
      fullName: m.user.fullName,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${m.user.fullName}`,
    }));

    const response: any = { members };

    // Only expose invite details to the owner
    if (role === 'OWNER') {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { inviteCode: true, inviteEnabled: true },
      });

      if (project) {
        const frontendOrigin = env.FRONTEND_ORIGIN || 'http://localhost:5173';
        response.inviteCode = project.inviteCode;
        response.inviteEnabled = project.inviteEnabled;
        response.inviteLink = `${frontendOrigin}/join?code=${project.inviteCode}`;
      }
    }

    res.status(200).json(response);
  }),

  /**
   * DELETE /api/projects/:id/members/:userId
   * OWNER only. Cannot remove the owner themselves.
   */
  removeMember: asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id as string;
    const targetUserId = req.params.userId as string;
    const requesterId = req.user!.id;

    // Verify requester is the owner
    await projectsService.findOwnedProjectOrFail(projectId, requesterId);

    // Cannot remove the owner
    if (targetUserId === requesterId) {
      throw new AppError('Cannot remove the project owner', 400);
    }

    // Verify target is actually a member
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUserId } },
      include: { user: { select: { fullName: true } } },
    });

    if (!membership) {
      throw new AppError('Member not found', 404);
    }

    if (membership.role === 'OWNER') {
      throw new AppError('Cannot remove a project owner', 400);
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });

    await prisma.activity.create({
      data: {
        userId: requesterId,
        action: 'removed member',
        target: membership.user.fullName,
      },
    });

    res.status(200).json({ message: 'Member removed successfully' });
  }),
};
