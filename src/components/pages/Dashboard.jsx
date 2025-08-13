import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import taskService from "@/services/api/taskService";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import { getAll } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import TodaysTasks from "@/components/molecules/TodaysTasks";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Tasks from "@/components/pages/Tasks";
import Projects from "@/components/pages/Projects";
import Card from "@/components/atoms/Card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalActiveClients: 0,
    activeProjects: 0,
    tasksDueToday: 0,
    overdueTasks: 0
  });
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
const [clients, projects, tasks] = await Promise.all([
        clientService.getAll(),
        projectService.getAll(),
        taskService.getAll()
      ]);
      
      // Calculate metrics with database field names
      const activeClients = clients.filter(client => (client.status_c || client.status) === "Active").length;
      const activeProjects = projects.filter(project => {
        const status = project.status_c || project.status;
        return status === "In Progress" || status === "Planning";
      }).length;
      
      const today = new Date().toISOString().split('T')[0];
      const tasksDueToday = tasks.filter(task => {
        const completed = task.completed_c !== undefined ? task.completed_c : task.completed;
        const dueDate = task.due_date_c || task.dueDate;
        return !completed && dueDate === today;
      }).length;
      
      const overdueTasks = tasks.filter(task => {
        const completed = task.completed_c !== undefined ? task.completed_c : task.completed;
        const dueDate = task.due_date_c || task.dueDate;
        if (completed || !dueDate) return false;
        return new Date(dueDate) < new Date(today);
      }).length;
      
      setStats({
        totalActiveClients: activeClients,
        activeProjects,
        tasksDueToday,
        overdueTasks
      });
      
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadDashboardData();
  }, []);

  // Trigger refresh of Today's Tasks when dashboard data changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [stats]);
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your business management</p>
        </div>
        <Loading type="stats" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your business management</p>
        </div>
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Track your progress, manage your work, and stay on top of your business metrics
        </p>
      </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Clients"
          value={stats.totalActiveClients}
          icon="Users"
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="Briefcase"
          color="green"
        />
        <StatCard
          title="Due Today"
          value={stats.tasksDueToday}
          icon="Clock"
          color="orange"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon="AlertTriangle"
          color="red"
        />
      </div>

      {/* Personal Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* My Milestones */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <ApperIcon name="Target" size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My Milestones</h2>
                <p className="text-sm text-gray-500">Track your key achievements</p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
<div className="space-y-4 max-h-80 overflow-y-auto">
              {[]
                .filter(activity => activity.type === 'milestone')
                .slice(0, 4)
                .map((milestone) => (
<div 
                    key={milestone.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${milestone.projectId || milestone.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{milestone.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{milestone.subtitle}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            In Progress
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(milestone.date)}</span>
                        </div>
                      </div>
                      <ApperIcon name="ChevronRight" size={16} className="text-gray-400 mt-1" />
                    </div>
                  </div>
                ))}
{[].filter(activity => activity.type === 'milestone').length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <ApperIcon name="Target" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No milestones to show</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* My Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ApperIcon name="Briefcase" size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
                <p className="text-sm text-gray-500">Active project overview</p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
<div className="space-y-4 max-h-80 overflow-y-auto">
              {[]
                .filter(activity => activity.type === 'project')
                .slice(0, 4)
                .map((project) => (
<div 
                    key={project.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{project.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{project.subtitle}</p>
                      </div>
                      <ApperIcon name="ChevronRight" size={16} className="text-gray-400 mt-1" />
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(project.date)}</span>
                    </div>
                  </div>
                ))}
{[].filter(activity => activity.type === 'project').length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <ApperIcon name="Briefcase" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No projects to show</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* My Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ApperIcon name="CheckSquare" size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
                <p className="text-sm text-gray-500">Your upcoming work</p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
<div className="space-y-3 max-h-80 overflow-y-auto">
              {[]
                .filter(activity => activity.type === 'task')
                .slice(0, 5)
                .map((task) => (
<div 
                    key={task.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{task.title}</h4>
                        <p className="text-xs text-gray-600 mb-2 truncate">{task.subtitle}</p>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                            High Priority
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(task.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
{[].filter(activity => activity.type === 'task').length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <ApperIcon name="CheckSquare" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No tasks to show</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Today's Tasks Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <ApperIcon name="Calendar" size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Today's Focus</h2>
              <p className="text-sm text-gray-500">Tasks scheduled for today</p>
            </div>
          </div>
        </div>
        <TodaysTasks key={refreshKey} />
      </Card>
</div>
  );
};

export default Dashboard;