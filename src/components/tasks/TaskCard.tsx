import React from 'react';
import type { Task } from '../../types';
import { VellumCard, Stamp } from '../common';
import { Calendar, Flag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onToggleComplete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onToggleComplete }) => {
  const isCompleted = task.status === 'Completed';

  const priorityColors = {
    Low: 'text-linework',
    Medium: 'text-amber-flag',
    High: 'text-signal-red',
  };

  return (
    <VellumCard hoverable className="flex flex-col p-4 h-full relative" onClick={onEdit}>
      <div className="flex justify-between items-start mb-3 gap-4">
        <h4 className={`font-display font-bold text-lg leading-tight flex-grow ${isCompleted ? 'line-through text-graphite/40' : ''}`}>
          {task.name}
        </h4>
        <div className="flex-shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onToggleComplete}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-linework rounded-sm"
            aria-label={isCompleted ? "Mark as pending" : "Mark as complete"}
          >
            <Stamp status={task.status} size="sm" animateIn={true} />
          </button>
        </div>
      </div>

      <p className={`font-body text-sm mb-4 flex-grow ${isCompleted ? 'text-graphite/40' : 'text-graphite/80'}`}>
        {task.description || 'No details provided.'}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-graphite/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-graphite/60">
            <Calendar className="w-3.5 h-3.5" />
            <span className={isCompleted ? 'line-through' : ''}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'NO DATE'}
            </span>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 font-mono text-xs uppercase font-bold tracking-wider ${isCompleted ? 'text-graphite/40' : priorityColors[task.priority]}`}>
          <Flag className="w-3.5 h-3.5" />
          {task.priority}
        </div>
      </div>
    </VellumCard>
  );
};
