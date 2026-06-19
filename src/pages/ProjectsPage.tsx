import React, { useEffect, useState, useCallback } from 'react';
import type { Project, ProjectStatus, ProjectHealth } from '../types';
import { projectsApi } from '../api';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Button, LoadingSpinner, VellumCard } from '../components/common';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [healthFilter, setHealthFilter] = useState<ProjectHealth | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'completion' | 'endDate'>('name');

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await projectsApi.getAll({ limit: 50 });
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Derived state for filtering and sorting
  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => statusFilter === 'All' || p.status === statusFilter)
    .filter(p => healthFilter === 'All' || p.health === healthFilter)
    .sort((a, b) => {
      if (sortBy === 'completion') return (b.completionPercentage || 0) - (a.completionPercentage || 0);
      if (sortBy === 'endDate') return new Date(a.endDate || '2099-01-01').getTime() - new Date(b.endDate || '2099-01-01').getTime();
      return a.name.localeCompare(b.name);
    });

  const getHealthBadgeClass = (health: string) => {
    switch (health) {
      case 'On Track': return 'bg-stamp-green/10 text-stamp-green border-stamp-green/20';
      case 'At Risk': return 'bg-amber-flag/10 text-amber-flag border-amber-flag/20';
      case 'Delayed': return 'bg-signal-red/10 text-signal-red border-signal-red/20';
      default: return 'bg-graphite/5 text-graphite/70 border-graphite/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-graphite/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-deepline tracking-tight">Project Directory</h1>
          <p className="font-mono text-sm text-graphite/60 mt-1 uppercase tracking-widest">Manage and track active initiatives</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="shrink-0" variant="gradient">
          <Plus className="w-4 h-4" /> Initialize Project
        </Button>
      </div>

      {/* Control Bar */}
      <VellumCard className="!p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-vellum/50 border border-graphite/20 pl-10 pr-4 py-2 font-body text-sm focus:outline-none focus:border-linework transition-colors rounded-lg placeholder:text-graphite/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-vellum/50 border border-graphite/20 rounded-lg px-2 py-1">
            <Filter className="w-4 h-4 text-graphite/40" />
            <select 
              className="bg-transparent font-mono text-xs uppercase tracking-wider text-graphite/80 focus:outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-vellum/50 border border-graphite/20 rounded-lg px-2 py-1">
            <Filter className="w-4 h-4 text-graphite/40" />
            <select 
              className="bg-transparent font-mono text-xs uppercase tracking-wider text-graphite/80 focus:outline-none cursor-pointer"
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value as ProjectHealth | 'All')}
            >
              <option value="All">All Health</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-vellum/50 border border-graphite/20 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-4 h-4 text-graphite/40" />
            <select 
              className="bg-transparent font-mono text-xs uppercase tracking-wider text-graphite/80 focus:outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Sort by Name</option>
              <option value="completion">Sort by Progress</option>
              <option value="endDate">Sort by Deadline</option>
            </select>
          </div>
        </div>
      </VellumCard>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <VellumCard className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2">
          <div className="w-16 h-16 rounded-full bg-graphite/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-graphite/20" />
          </div>
          <h3 className="font-display font-bold text-xl text-deepline mb-2">No Projects Found</h3>
          <p className="font-body text-graphite/60 max-w-md">
            We couldn't find any projects matching your current filters. Try adjusting your search query or criteria.
          </p>
          <Button 
            variant="ghost" 
            className="mt-6"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setHealthFilter('All');
            }}
          >
            Clear Filters
          </Button>
        </VellumCard>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-deepline/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VellumCard className="w-full max-w-lg">
            <h2 className="font-display font-bold text-2xl text-deepline mb-6">Initialize New Project</h2>
            <ProjectForm
              onSubmit={async (data) => {
                try {
                  await projectsApi.create(data);
                  setIsFormOpen(false);
                  fetchProjects();
                  toast.success('Project initialized successfully');
                } catch (error) {
                  toast.error('Failed to initialize project');
                }
              }}
              onCancel={() => setIsFormOpen(false)}
              isLoading={false}
            />
          </VellumCard>
        </div>
      )}
    </div>
  );
};
