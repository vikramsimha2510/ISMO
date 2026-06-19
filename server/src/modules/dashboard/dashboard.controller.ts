import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  getStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await dashboardService.getStats(req.user!.id);
    res.status(200).json(stats);
  }),
};
