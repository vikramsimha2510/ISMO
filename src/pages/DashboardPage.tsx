import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import type { DashboardStats } from '../api';
import { VellumCard, LoadingSpinner } from '../components/common';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  FolderGit2, 
  CheckSquare, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Clock,
  ChevronRight, 
  GitCommit,
  Milestone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  if (isLoading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const kpis = [
    { label: 'Active Projects', value: stats.projectsInProgress, total: stats.totalProjects, icon: FolderGit2, color: 'text-linework' },
    { label: 'Task Completion', value: stats.completedTasks, total: stats.totalTasks, icon: CheckSquare, color: 'text-stamp-green' },
    { label: 'Team Members', value: stats.teamMembersCount, total: null, icon: Users, color: 'text-amber-flag' },
    { label: 'Productivity Score', value: `${stats.productivityScore}%`, total: null, icon: TrendingUp, color: 'text-[#7FD4E8]' },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-signal-red" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-stamp-green" />;
      default: return <Info className="w-5 h-5 text-linework" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-graphite/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-deepline tracking-tight">System Overview</h1>
          <p className="font-mono text-sm text-graphite/60 mt-1 uppercase tracking-widest">Real-time Telemetry & Analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">


          <div className="hidden sm:flex items-center gap-2 bg-linework/10 text-linework px-4 py-2 rounded-lg border border-linework/20 shadow-[0_0_15px_rgba(94,200,224,0.1)]">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase font-bold">System Nominal</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <VellumCard key={index} className="!p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(14,31,51,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <kpi.icon className={`w-16 h-16 ${kpi.color}`} />
            </div>
            <div className="relative z-10">
              <p className="font-mono text-xs text-graphite/60 uppercase tracking-widest mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-deepline tracking-tight">{kpi.value}</span>
                {kpi.total && (
                  <span className="font-mono text-sm text-graphite/40">/ {kpi.total}</span>
                )}
              </div>
            </div>
            {/* Decoration line */}
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-20 ${kpi.color.replace('text-', 'bg-')}`}></div>
          </VellumCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Insights (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Chart */}
          <VellumCard className="!p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-graphite/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-vellum/50">
              <div>
                <h3 className="font-display font-bold text-lg text-deepline">Project Progress Velocity</h3>
                <p className="font-mono text-xs text-graphite/50 uppercase tracking-widest">Expected vs Completed Tasks (7 Days)</p>
              </div>
            </div>
            <div className="p-4 sm:p-6 h-[300px] w-full blueprint-bg relative min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.progressTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--linework)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--linework)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--graphite)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--graphite)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(28, 37, 48, 0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--graphite)', opacity: 0.5 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--graphite)', opacity: 0.5 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--deepline)', border: 'none', borderRadius: '8px', color: 'var(--vellum)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: 'var(--linework)' }}
                  />
                  <Area type="monotone" dataKey="expected" stroke="var(--graphite)" strokeOpacity={0.3} strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" />
                  <Area type="monotone" dataKey="completed" stroke="var(--linework)" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" activeDot={{ r: 6, fill: 'var(--linework)', stroke: 'var(--vellum)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </VellumCard>

          {/* AI Insights Panel */}
          <VellumCard className="!p-6 bg-gradient-to-br from-vellum to-vellum/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-linework/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-linework" />
              </div>
              <h3 className="font-display font-bold text-lg text-deepline">Platform Intelligence</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.insights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-xl border border-graphite/10 bg-white/50 backdrop-blur hover:bg-white transition-colors duration-300">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div>
                      <p className="font-body text-sm text-deepline mb-2 leading-relaxed">{insight.message}</p>
                      {insight.action && (
                        <button className="font-mono text-xs font-bold text-linework hover:text-linework-text transition-colors flex items-center gap-1 uppercase tracking-wider">
                          {insight.action} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </VellumCard>
        </div>

        {/* Right Column: Feeds & Deadlines (1/3 width) */}
        <div className="space-y-8">
          
          {/* Upcoming Deadlines */}
          <VellumCard className="!p-0 overflow-hidden flex flex-col h-[300px]">
            <div className="p-5 border-b border-graphite/5 bg-vellum/50 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-deepline flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-flag" /> Critical Deadlines
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {stats.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="p-4 hover:bg-graphite/5 rounded-lg transition-colors group cursor-pointer border-b border-graphite/5 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-graphite/10 text-graphite/70 uppercase tracking-wider group-hover:bg-linework/10 group-hover:text-linework transition-colors">
                      {deadline.projectName}
                    </span>
                    <span className={`font-mono text-xs font-bold ${deadline.daysRemaining <= 3 ? 'text-signal-red' : 'text-amber-flag'}`}>
                      {deadline.daysRemaining} days left
                    </span>
                  </div>
                  <p className="font-body text-sm font-semibold text-deepline truncate">{deadline.taskName}</p>
                  <p className="font-mono text-xs text-graphite/50 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(deadline.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </VellumCard>

          {/* Activity Feed */}
          <VellumCard className="!p-0 overflow-hidden flex flex-col h-[400px]">
            <div className="p-5 border-b border-graphite/5 bg-vellum/50">
              <h3 className="font-display font-bold text-lg text-deepline flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-linework" /> Global Activity
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {stats.recentActivities.map((activity, index) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Timeline line */}
                  {index !== stats.recentActivities.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-graphite/10"></div>
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-vellum border-2 border-linework flex items-center justify-center z-10 overflow-hidden">
                    <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="font-body text-sm text-graphite/80">
                    <span className="font-semibold text-deepline">{activity.user.name}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-semibold text-deepline">{activity.target}</span>
                  </div>
                  <p className="font-mono text-xs text-graphite/40 mt-1 uppercase tracking-wider">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </VellumCard>

        </div>
      </div>
    </div>
  );
};
