import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { inviteService } from './invite.service.js';

export const inviteController = {
  joinProject: asyncHandler(async (req: Request, res: Response) => {
    const result = await inviteService.joinProject(req.user!.id, req.body.inviteCode);
    res.status(200).json(result);
  }),

  regenerateInvite: asyncHandler(async (req: Request, res: Response) => {
    const result = await inviteService.regenerateInvite(req.params.id as string, req.user!.id);
    res.status(200).json(result);
  }),

  toggleInvite: asyncHandler(async (req: Request, res: Response) => {
    const result = await inviteService.toggleInvite(req.params.id as string, req.user!.id);
    res.status(200).json(result);
  }),
};
