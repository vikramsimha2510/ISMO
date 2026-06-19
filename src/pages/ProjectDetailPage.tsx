import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, tasksApi } from '../api';
import type { Project, Task } from '../types';
import { Button, LoadingSpinner, VellumCard, Stamp } from '../components/common';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { ProjectForm } from '../components/projects/ProjectForm';
import { MembersPanel } from '../components/projects/MembersPanel';
import { ArrowLeft, Plus, Search, Filter, Trash2, Edit3, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showProjectEdit, setShowProjectEdit] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        projectsApi.getById(id),
        tasksApi.getAll({ projectId: id, search, status: statusFilter, priority: priorityFilter })
      ]);
      setProject(projRes);
      setTasks(tasksRes.data);
    } catch (e: any) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  }, [id, search, statusFilter, priorityFilter, navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchData]);

  const handleCreateTask = async (data: any) => {
    try {
      setIsSubmitting(true);
      await tasksApi.create({ ...data, projectId: id });
      toast.success('Task recorded');
      setShowTaskForm(false);
      fetchData();
    } catch (e: any) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    try {
      setIsSubmitting(true);
      await tasksApi.update(editingTask.id, data);
      toast.success('Task updated');
      setEditingTask(null);
      fetchData();
    } catch (e: any) {
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      await tasksApi.update(task.id, { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
    } catch (e: any) {
      toast.error('Failed to update task status');
      fetchData(); // Revert on failure
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Confirm permanent deletion of this task record?')) return;
    try {
      await tasksApi.delete(taskId);
      toast.success('Task deleted');
      setEditingTask(null);
      fetchData();
    } catch (e: any) {
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await projectsApi.update(id, data);
      toast.success('Project updated');
      setShowProjectEdit(false);
      fetchData();
    } catch (e: any) {
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    if (!window.confirm('WARNING: Confirm permanent deletion of this project and all associated tasks?')) return;
    try {
      await projectsApi.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (e: any) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading && !project) return <LoadingSpinner />;
  if (!project) return null;

  const isOwner = project.role === 'OWNER';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-graphite/60 hover:text-linework font-mono text-xs uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      {/* Project Header Block */}
      <VellumCard className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 border-b border-graphite/10 pb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-display text-4xl font-bold">{project.name}</h1>
              <Stamp status={project.status} size="md" />
            </div>
            <p className="font-body text-graphite/80 max-w-2xl">
              {project.description || 'No description provided.'}
            </p>
          </div>
          <div className="flex gap-3 self-end md:self-auto">
            {isOwner && (
              <>
                <Button variant="ghost" onClick={() => setShowProjectEdit(true)}>
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
                <Button variant="danger" onClick={handleDeleteProject}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 font-mono text-sm uppercase tracking-widest text-graphite/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-linework" />
            <span>START: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-flag" />
            <span>END: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}</span>
          </div>
        </div>
      </VellumCard>

      {/* Members Panel */}
      {id && <MembersPanel projectId={id} userRole={project.role || 'MEMBER'} />}

      {/* Tasks Section */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl font-bold text-vellum">Task Registry</h2>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>

        {/* Task Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite/50" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full bg-vellum/5 border border-graphite/20 text-vellum pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-linework focus:ring-1 focus:ring-linework"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-40">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite/50 pointer-events-none" />
              <select 
                className="w-full bg-vellum/5 border border-graphite/20 text-vellum pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-linework focus:ring-1 focus:ring-linework appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="" className="bg-deepline text-vellum">All Status</option>
                <option value="Pending" className="bg-deepline text-vellum">Pending</option>
                <option value="In Progress" className="bg-deepline text-vellum">In Progress</option>
                <option value="Completed" className="bg-deepline text-vellum">Completed</option>
              </select>
            </div>
            <div className="relative w-full md:w-40">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite/50 pointer-events-none" />
              <select 
                className="w-full bg-vellum/5 border border-graphite/20 text-vellum pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-linework focus:ring-1 focus:ring-linework appearance-none"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="" className="bg-deepline text-vellum">All Priority</option>
                <option value="Low" className="bg-deepline text-vellum">Low</option>
                <option value="Medium" className="bg-deepline text-vellum">Medium</option>
                <option value="High" className="bg-deepline text-vellum">High</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : tasks.length === 0 ? (
          <VellumCard className="p-12 text-center border-dashed">
            <p className="font-mono text-graphite/60 uppercase tracking-widest mb-4">No tasks found</p>
          </VellumCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tasks.map(t => (
              <TaskCard 
                key={t.id} 
                task={t} 
                onEdit={() => setEditingTask(t)}
                onToggleComplete={() => handleToggleTaskComplete(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-deepline/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VellumCard className="w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-bold mb-6 border-b border-graphite/10 pb-4">
              {editingTask ? 'Edit Task Record' : 'Initialize Task'}
            </h2>
            <TaskForm 
              initialData={editingTask || undefined}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask} 
              onCancel={() => { setShowTaskForm(false); setEditingTask(null); }} 
              isLoading={isSubmitting} 
              onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
            />
          </VellumCard>
        </div>
      )}

      {showProjectEdit && (
        <div className="fixed inset-0 bg-deepline/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VellumCard className="w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-bold mb-6 border-b border-graphite/10 pb-4">
              Update Project Parameters
            </h2>
            <ProjectForm 
              initialData={project}
              onSubmit={handleUpdateProject} 
              onCancel={() => setShowProjectEdit(false)} 
              isLoading={isSubmitting} 
            />
          </VellumCard>
        </div>
      )}
    </div>
  );
};
