import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Project, ProjectStatus } from '../../types';
import { Input, Select, Button } from '../common';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed'] as const),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "End date cannot be before start date",
  path: ["endDate"],
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSubmit: (data: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'Not Started',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Project Name"
        registration={register('name')}
        error={errors.name?.message}
      />
      <Input
        label="Description"
        registration={register('description')}
        error={errors.description?.message}
      />
      
      <Select
        label="Status"
        options={[
          { value: 'Not Started', label: 'Not Started' },
          { value: 'In Progress', label: 'In Progress' },
          { value: 'Completed', label: 'Completed' },
        ]}
        registration={register('status')}
        error={errors.status?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          registration={register('startDate')}
          error={errors.startDate?.message}
        />
        <Input
          label="End Date"
          type="date"
          registration={register('endDate')}
          error={errors.endDate?.message}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-graphite/10">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Project' : 'Initialize Project'}
        </Button>
      </div>
    </form>
  );
};
