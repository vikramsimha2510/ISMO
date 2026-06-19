import React from 'react';
import type { Project, ProjectHealth } from '../../types';
import { VellumCard, Stamp } from '../common';
import { useNavigate } from 'react-router-dom';
import { Folder, Calendar, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const getHealthConfig = (health?: ProjectHealth) => {
    switch (health) {
      case 'On Track': return { icon: CheckCircle2, color: 'text-stamp-green', bg: 'bg-stamp-green/10' };
      case 'At Risk': return { icon: AlertCircle, color: 'text-amber-flag', bg: 'bg-amber-flag/10' };
      case 'Delayed': return { icon: Clock, color: 'text-signal-red', bg: 'bg-signal-red/10' };
      default: return { icon: CheckCircle2, color: 'text-graphite', bg: 'bg-graphite/10' };
    }
  };

  const healthConfig = getHealthConfig(project.health);
  const HealthIcon = healthConfig.icon;

  return (
    <VellumCard 
      hoverable 
      className="cursor-pointer group flex flex-col h-full"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-linework/20 to-linework/5 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(94,200,224,0.3)] transition-all">
            <Folder className="w-5 h-5 text-linework" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-deepline group-hover:text-linework transition-colors">{project.name}</h3>
            {project.health && (
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider mt-1 ${healthConfig.bg} ${healthConfig.color}`}>
                <HealthIcon className="w-3 h-3" /> {project.health}
              </div>
            )}
          </div>
        </div>
        <Stamp status={project.status} size="sm" />
      </div>

      {project.description && (
        <p className="font-body text-sm text-graphite/70 mb-6 line-clamp-2 leading-relaxed flex-1">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      {project.completionPercentage !== undefined && (
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-graphite/50">Progress</span>
            <span className="font-display font-bold text-deepline">{project.completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-graphite/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linework rounded-full relative"
              style={{ width: `${project.completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-graphite/10 mt-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-xs text-graphite/60 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No Deadline'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-graphite/60 uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{project.taskCount || 0} Tasks</span>
          </div>
        </div>

        {/* Team Avatars */}
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map((member, i) => (
              <img 
                key={member.id} 
                src={member.avatar} 
                alt={member.name} 
                title={member.name}
                className="w-7 h-7 rounded-full border-2 border-vellum object-cover relative"
                style={{ zIndex: 3 - i }}
              />
            ))}
            {project.teamMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-vellum bg-graphite/5 flex items-center justify-center font-mono text-[10px] text-graphite/60 font-bold relative z-0">
                +{project.teamMembers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </VellumCard>
  );
};
