import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const mapTaskStatusToDb = (status: string): TaskStatus => {
  switch (status) {
    case 'Pending': return TaskStatus.PENDING;
    case 'In Progress': return TaskStatus.IN_PROGRESS;
    case 'Completed': return TaskStatus.COMPLETED;
    default: return TaskStatus.PENDING;
  }
};

export const mapDbToTaskStatus = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.PENDING: return 'Pending';
    case TaskStatus.IN_PROGRESS: return 'In Progress';
    case TaskStatus.COMPLETED: return 'Completed';
    default: return 'Pending';
  }
};

export const mapTaskPriorityToDb = (priority: string): TaskPriority => {
  switch (priority) {
    case 'Low': return TaskPriority.LOW;
    case 'Medium': return TaskPriority.MEDIUM;
    case 'High': return TaskPriority.HIGH;
    default: return TaskPriority.MEDIUM;
  }
};

export const mapDbToTaskPriority = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.LOW: return 'Low';
    case TaskPriority.MEDIUM: return 'Medium';
    case TaskPriority.HIGH: return 'High';
    default: return 'Medium';
  }
};

const taskStatusEnum = z.enum(['Pending', 'In Progress', 'Completed']);
const taskPriorityEnum = z.enum(['Low', 'Medium', 'High']);

export const createTaskSchema = z.object({
  projectId: z
    .string({ required_error: 'Project ID is required' })
    .min(1, 'Project ID cannot be empty'),
  name: z
    .string({ required_error: 'Task name is required' })
    .min(1, 'Task name cannot be empty')
    .max(200, 'Task name is too long'),
  description: z.string().max(2000).optional(),
  priority: taskPriorityEnum.default('Medium').transform(mapTaskPriorityToDb),
  status: taskStatusEnum.default('Pending').transform(mapTaskStatusToDb),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: taskPriorityEnum.optional().transform((val) => (val ? mapTaskPriorityToDb(val) : undefined)),
  status: taskStatusEnum.optional().transform((val) => (val ? mapTaskStatusToDb(val) : undefined)),
  dueDate: z.coerce.date().optional().nullable(),
});

export const taskQuerySchema = z.object({
  projectId: z.string().optional(),
  search: z.string().optional(),
  status: z.preprocess((val) => val === '' ? undefined : val, taskStatusEnum.optional()).transform((val) => (val ? mapTaskStatusToDb(val) : undefined)),
  priority: z.preprocess((val) => val === '' ? undefined : val, taskPriorityEnum.optional()).transform((val) => (val ? mapTaskPriorityToDb(val) : undefined)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
