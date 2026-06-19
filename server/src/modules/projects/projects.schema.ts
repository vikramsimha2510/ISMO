import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const mapStatusToDb = (status: string): ProjectStatus => {
  switch (status) {
    case 'Not Started': return ProjectStatus.NOT_STARTED;
    case 'In Progress': return ProjectStatus.IN_PROGRESS;
    case 'Completed': return ProjectStatus.COMPLETED;
    default: return ProjectStatus.NOT_STARTED;
  }
};

export const mapDbToStatus = (status: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.NOT_STARTED: return 'Not Started';
    case ProjectStatus.IN_PROGRESS: return 'In Progress';
    case ProjectStatus.COMPLETED: return 'Completed';
    default: return 'Not Started';
  }
};

const projectStatusEnum = z.enum(['Not Started', 'In Progress', 'Completed']);


export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(1, 'Project name cannot be empty')
    .max(200, 'Project name is too long'),
  description: z.string().max(2000).optional(),
  status: projectStatusEnum.default('Not Started').transform(mapStatusToDb),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: projectStatusEnum.optional().transform((val) => (val ? mapStatusToDb(val) : undefined)),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const projectQuerySchema = z.object({
  search: z.string().optional(),
  status: z.preprocess((val) => val === '' ? undefined : val, projectStatusEnum.optional()).transform((val) => (val ? mapStatusToDb(val) : undefined)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
