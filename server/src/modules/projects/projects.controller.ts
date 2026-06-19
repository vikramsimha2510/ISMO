import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { projectsService } from './projects.service.js';

export const projectsController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await projectsService.getAll(req.user!.id, req.query as any);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectsService.getById(req.params.id as string, req.user!.id);
    res.status(200).json(project);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectsService.create(req.user!.id, req.body);
    res.status(201).json(project);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectsService.update(req.params.id as string, req.user!.id, req.body);
    res.status(200).json(project);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await projectsService.remove(req.params.id as string, req.user!.id);
    res.status(204).send();
  }),
};
