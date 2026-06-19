import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Task, TaskPriority, TaskStatus } from '../../types';
import { Input, Select, Button } from '../common';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High'] as const),
  status: z.enum(['Pending', 'In Progress', 'Completed'] as const),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  onDelete?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isLoading, onDelete }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'Medium',
      status: initialData?.status || 'Pending',
      dueDate: initialData?.dueDate || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Task Name"
        registration={register('name')}
        error={errors.name?.message}
      />
      <Input
        label="Description"
        registration={register('description')}
        error={errors.description?.message}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
          ]}
          registration={register('priority')}
          error={errors.priority?.message}
        />
        <Select
          label="Status"
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
          ]}
          registration={register('status')}
          error={errors.status?.message}
        />
      </div>

      <Input
        label="Due Date"
        type="date"
        registration={register('dueDate')}
        error={errors.dueDate?.message}
      />

      <div className="flex justify-between items-center pt-6 border-t border-graphite/10">
        {onDelete ? (
          <Button type="button" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        ) : <div></div>}
        
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </div>
    </form>
  );
};
