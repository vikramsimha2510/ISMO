import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { tasksService } from './tasks.service.js';

export const tasksController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await tasksService.getAll(req.user!.id, req.query as any);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const task = await tasksService.getById(req.params.id as string, req.user!.id);
    res.status(200).json(task);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await tasksService.create(req.user!.id, req.body);
    res.status(201).json(task);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const task = await tasksService.update(req.params.id as string, req.user!.id, req.body);
    res.status(200).json(task);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await tasksService.remove(req.params.id as string, req.user!.id);
    res.status(204).send();
  }),
};
