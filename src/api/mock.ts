import MockAdapter from 'axios-mock-adapter';
import type { AxiosInstance } from 'axios';
import type { Project, Task, User, TeamMember, AIInsight, ActivityLog, UpcomingDeadline, ChartDataPoint, ProjectHealth, ProjectStatus, TaskStatus, TaskPriority } from '../types';

export function setupMockAPI(apiClient: AxiosInstance) {
  const mock = new MockAdapter(apiClient, { delayResponse: 500 });

  // Generate Team Members
  const teamMembers: TeamMember[] = [
    { id: 'tm_1', name: 'Sarah Chen', role: 'Lead Architect', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah' },
    { id: 'tm_2', name: 'Marcus Johnson', role: 'Senior Engineer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus' },
    { id: 'tm_3', name: 'Elena Rodriguez', role: 'Product Manager', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena' },
    { id: 'tm_4', name: 'David Kim', role: 'DevOps Specialist', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=David' },
    { id: 'tm_5', name: 'Aisha Patel', role: 'UX Designer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aisha' },
    { id: 'tm_6', name: 'James Wilson', role: 'Frontend Developer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=James' },
    { id: 'tm_7', name: 'Wei Zhang', role: 'Backend Engineer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wei' },
    { id: 'tm_8', name: 'Olivia Smith', role: 'QA Lead', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Olivia' },
    { id: 'tm_9', name: 'Michael Brown', role: 'Data Scientist', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Michael' },
    { id: 'tm_10', name: 'Emma Davis', role: 'Security Ops', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Emma' },
    { id: 'tm_11', name: 'Lucas Garcia', role: 'Systems Analyst', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Lucas' },
    { id: 'tm_12', name: 'Sophie Martin', role: 'Technical Writer', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sophie' },
  ];

  const getTeamSubset = (count: number) => {
    const shuffled = [...teamMembers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Generate Projects
  let projects: Project[] = [
    {
      id: 'proj_1',
      name: 'MEDISYNC AI',
      description: 'Healthcare data synchronization platform using machine learning for predictive patient outcomes.',
      status: 'In Progress',
      completionPercentage: 78,
      health: 'On Track',
      startDate: '2025-11-01T00:00:00Z',
      endDate: '2026-08-15T00:00:00Z',
      teamMembers: getTeamSubset(6),
    },
    {
      id: 'proj_2',
      name: 'Linework Platform V2',
      description: 'Next-generation project management SaaS overhaul with AI insights and enterprise features.',
      status: 'In Progress',
      completionPercentage: 55,
      health: 'At Risk',
      startDate: '2026-01-10T00:00:00Z',
      endDate: '2026-10-30T00:00:00Z',
      teamMembers: getTeamSubset(8),
    },
    {
      id: 'proj_3',
      name: 'Smart Inventory System',
      description: 'IoT-enabled warehouse inventory tracking and automated supply chain routing.',
      status: 'Completed',
      completionPercentage: 100,
      health: 'On Track',
      startDate: '2025-05-15T00:00:00Z',
      endDate: '2026-03-20T00:00:00Z',
      teamMembers: getTeamSubset(4),
    },
    {
      id: 'proj_4',
      name: 'College ERP Solution',
      description: 'Unified university management portal for student records, grading, and faculty administration.',
      status: 'In Progress',
      completionPercentage: 44,
      health: 'Delayed',
      startDate: '2026-03-01T00:00:00Z',
      endDate: '2027-01-15T00:00:00Z',
      teamMembers: getTeamSubset(5),
    },
    {
      id: 'proj_5',
      name: 'Customer Analytics Dashboard',
      description: 'Real-time telemetry and user behavior analytics dashboard for B2B clients.',
      status: 'In Progress',
      completionPercentage: 83,
      health: 'On Track',
      startDate: '2026-02-15T00:00:00Z',
      endDate: '2026-07-30T00:00:00Z',
      teamMembers: getTeamSubset(7),
    }
  ];

  // Generate Tasks (10 per project)
  let tasks: Task[] = [];
  projects.forEach((proj, pIndex) => {
    for (let i = 0; i < 10; i++) {
      const isCompleted = i < (proj.completionPercentage || 0) / 10;
      const statuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
      const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
      
      const team = proj.teamMembers || teamMembers;
      const assignee = team[Math.floor(Math.random() * team.length)];
      
      const d = new Date();
      d.setDate(d.getDate() + (Math.floor(Math.random() * 30) - 10));

      tasks.push({
        id: `task_${pIndex}_${i}`,
        projectId: proj.id,
        name: `Engineering Task ${pIndex + 1}.${i + 1} - ${['Architecture', 'Implementation', 'Testing', 'Deployment', 'Review'][i % 5]}`,
        description: 'Detailed specification and execution for this segment of the sprint.',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: isCompleted ? 'Completed' : statuses[Math.floor(Math.random() * 2)],
        dueDate: d.toISOString(),
        assignee
      });
    }
    proj.taskCount = 10;
  });

  let users: User[] = [
    { id: 'user_admin', fullName: 'System Administrator', email: 'admin@linework.app' }
  ];

  // Helper to check auth
  const getAuthUser = (headers: any) => {
    const auth = headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return auth.split(' ')[1]; 
  };

  // Auth endpoints
  mock.onPost('/auth/register').reply((config) => {
    const { fullName, email } = JSON.parse(config.data);
    const user: User = { id: `user_${Date.now()}`, fullName, email };
    users.push(user);
    return [200, { user, token: `mock_token_${user.id}` }];
  });

  mock.onPost('/auth/login').reply((config) => {
    const { email } = JSON.parse(config.data);
    let user = users.find(u => u.email === email);
    if (!user) {
      user = { id: 'user_demo', fullName: 'Demo Engineer', email };
      users.push(user);
    }
    return [200, { user, token: `mock_token_${user.id}` }];
  });

  mock.onPost('/auth/logout').reply(200, { message: 'Logged out' });

  // Projects endpoints
  mock.onGet('/projects').reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const { search, status, page = 1, limit = 10 } = config.params || {};
    let filtered = [...projects];
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (status) filtered = filtered.filter(p => p.status === status);
    
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    return [200, { data: paginated, total: filtered.length, page, limit }];
  });

  mock.onGet(/\/projects\/.+/).reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const id = config.url?.split('/').pop();
    const project = projects.find(p => p.id === id);
    if (!project) return [404, { message: 'Not found' }];
    return [200, project];
  });

  mock.onPost('/projects').reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const data = JSON.parse(config.data);
    const newProject: Project = { 
      ...data, 
      id: `proj_${Date.now()}`,
      taskCount: 0,
      completionPercentage: 0,
      health: 'On Track',
      teamMembers: []
    };
    projects.push(newProject);
    return [201, newProject];
  });

  mock.onPut(/\/projects\/.+/).reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const id = config.url?.split('/').pop();
    const data = JSON.parse(config.data);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return [404, { message: 'Not found' }];
    projects[index] = { ...projects[index], ...data };
    return [200, projects[index]];
  });

  mock.onDelete(/\/projects\/.+/).reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const id = config.url?.split('/').pop();
    projects = projects.filter(p => p.id !== id);
    tasks = tasks.filter(t => t.projectId !== id);
    return [200, { message: 'Deleted' }];
  });

  // Tasks endpoints
  mock.onGet('/tasks').reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const { projectId, page = 1, limit = 100 } = config.params || {};
    let filtered = [...tasks];
    if (projectId) filtered = filtered.filter(t => t.projectId === projectId);
    
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    return [200, { data: paginated, total: filtered.length, page, limit }];
  });

  mock.onGet(/\/tasks\/.+/).reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const id = config.url?.split('/').pop();
    const task = tasks.find(t => t.id === id);
    if (!task) return [404, { message: 'Not found' }];
    return [200, task];
  });

  mock.onPost('/tasks').reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const data = JSON.parse(config.data);
    const newTask: Task = { ...data, id: `task_${Date.now()}` };
    tasks.push(newTask);
    return [201, newTask];
  });

  mock.onPut(/\/tasks\/.+/).reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const id = config.url?.split('/').pop();
    const data = JSON.parse(config.data);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return [404, { message: 'Not found' }];
    tasks[index] = { ...tasks[index], ...data };
    return [200, tasks[index]];
  });

  mock.onDelete(/\/tasks\/.+/).reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];
    const id = config.url?.split('/').pop();
    tasks = tasks.filter(t => t.id !== id);
    return [200, { message: 'Deleted' }];
  });

  // Dashboard stats endpoint
  mock.onGet('/dashboard/stats').reply((config) => {
    if (!getAuthUser(config.headers)) return [401, { message: 'Unauthorized' }];

    const insights: AIInsight[] = [
      { id: 'i1', type: 'warning', message: 'College ERP Solution is drifting from timeline. Projected 3 weeks delay.', action: 'Review Timeline' },
      { id: 'i2', type: 'success', message: 'Smart Inventory System deployment was successful. Zero rollbacks detected.', action: 'View Metrics' },
      { id: 'i3', type: 'info', message: 'Team productivity increased by 14% across Linework Platform V2 this sprint.', action: 'View Report' },
      { id: 'i4', type: 'warning', message: 'High workload detected for Backend Engineers. Reassignment recommended.', action: 'Manage Workload' }
    ];

    const recentActivities: ActivityLog[] = [
      { id: 'a1', user: teamMembers[0], action: 'pushed commit to', target: 'MEDISYNC AI Core', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 'a2', user: teamMembers[2], action: 'approved pull request in', target: 'Linework Platform V2', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 'a3', user: teamMembers[4], action: 'completed milestone in', target: 'Customer Analytics', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'a4', user: teamMembers[7], action: 'opened an issue on', target: 'Smart Inventory System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { id: 'a5', user: teamMembers[10], action: 'deployed staging environment for', target: 'College ERP Solution', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ];

    const upcomingDeadlines: UpcomingDeadline[] = [
      { id: 'd1', projectId: 'proj_2', projectName: 'Linework V2', taskName: 'API Gateway Scaling', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), daysRemaining: 2 },
      { id: 'd2', projectId: 'proj_4', projectName: 'College ERP', taskName: 'DB Migration Script', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), daysRemaining: 4 },
      { id: 'd3', projectId: 'proj_1', projectName: 'MEDISYNC', taskName: 'HIPAA Compliance Audit', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), daysRemaining: 5 },
      { id: 'd4', projectId: 'proj_5', projectName: 'Analytics Dashboard', taskName: 'Data Pipeline Optimization', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), daysRemaining: 7 },
    ];

    const progressTrend: ChartDataPoint[] = [
      { name: 'Mon', completed: 12, expected: 15 },
      { name: 'Tue', completed: 18, expected: 16 },
      { name: 'Wed', completed: 25, expected: 20 },
      { name: 'Thu', completed: 22, expected: 25 },
      { name: 'Fri', completed: 35, expected: 30 },
      { name: 'Sat', completed: 10, expected: 5 },
      { name: 'Sun', completed: 15, expected: 5 },
    ];

    const stats = {
      totalProjects: projects.length,
      projectsInProgress: projects.filter(p => p.status === 'In Progress').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      pendingTasks: tasks.filter(t => t.status !== 'Completed').length,
      productivityScore: 92,
      teamMembersCount: teamMembers.length,
      insights,
      recentActivities,
      upcomingDeadlines,
      progressTrend
    };
    return [200, stats];
  });

  console.log('Mock API initialized with Realistic Data');
}
