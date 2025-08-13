import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow, isToday, isYesterday, subDays, startOfDay, endOfDay } from 'date-fns';
import activityService from '@/services/api/activityService';
import projectService from '@/services/api/projectService';
import { getAll as getTeamMembers } from '@/services/api/teamMemberService';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import { useNavigate } from 'react-router-dom';

const ActivityFeed = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    projectId: '',
    teamMemberId: '',
    type: '',
    dateRange: 'all'
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [activitiesData, projectsData, teamMembersData] = await Promise.all([
        activityService.getAll(),
        projectService.getAll(),
        getTeamMembers()
      ]);
      
      setActivities(activitiesData);
      setProjects(projectsData);
      setTeamMembers(teamMembersData);
    } catch (err) {
      console.error('Error loading activity feed:', err);
      setError(err.message);
      toast.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      let filterParams = {};
      
      if (filters.projectId) {
        filterParams.projectId = parseInt(filters.projectId);
      }
      
      if (filters.teamMemberId) {
        filterParams.teamMemberId = parseInt(filters.teamMemberId);
      }
      
      if (filters.type) {
        filterParams.type = filters.type;
      }
      
      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        switch (filters.dateRange) {
          case 'today':
            filterParams.startDate = startOfDay(now).toISOString();
            filterParams.endDate = endOfDay(now).toISOString();
            break;
          case 'yesterday':
            const yesterday = subDays(now, 1);
            filterParams.startDate = startOfDay(yesterday).toISOString();
            filterParams.endDate = endOfDay(yesterday).toISOString();
            break;
          case 'week':
            filterParams.startDate = subDays(now, 7).toISOString();
            break;
          case 'month':
            filterParams.startDate = subDays(now, 30).toISOString();
            break;
        }
      }
      
      const filteredActivities = await activityService.getAll(filterParams);
      setActivities(filteredActivities);
    } catch (err) {
      console.error('Error applying filters:', err);
      toast.error('Failed to filter activities');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      projectId: '',
      teamMemberId: '',
      type: '',
      dateRange: 'all'
    });
    setSearchTerm('');
  };

  const getFilteredActivities = () => {
    if (!searchTerm) return activities;
    
    return activities.filter(activity => 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectName(activity.projectId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTeamMemberName(activity.userId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getProjectName = (projectId) => {
    if (!projectId) return '';
    const project = projects.find(p => p.Id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getTeamMemberName = (userId) => {
    if (!userId) return '';
    const member = teamMembers.find(m => m.Id === userId);
    return member ? member.name : 'Unknown User';
  };

  const getActivityTypeDisplayName = (type) => {
    const typeNames = {
      task_created: 'Task Created',
      task_updated: 'Task Updated',
      task_completed: 'Task Completed',
      task_deleted: 'Task Deleted',
      comment_created: 'Comment Added',
      comment_updated: 'Comment Updated',
      comment_deleted: 'Comment Deleted',
      file_uploaded: 'File Uploaded',
      file_deleted: 'File Deleted',
      milestone_created: 'Milestone Created',
      milestone_updated: 'Milestone Updated',
      milestone_completed: 'Milestone Completed',
      milestone_deleted: 'Milestone Deleted',
      project_updated: 'Project Updated',
      tasklist_created: 'Task List Created',
      tasklist_updated: 'Task List Updated',
      tasklist_deleted: 'Task List Deleted'
    };
    
    return typeNames[type] || type;
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  };

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt);
      let groupKey;
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const filteredActivities = getFilteredActivities();
  const groupedActivities = groupActivitiesByDate(filteredActivities);
  const hasFilters = filters.projectId || filters.teamMemberId || filters.type || filters.dateRange !== 'all' || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with all project activities and team interactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
          >
            <ApperIcon name="RefreshCw" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Project Filter */}
          <div>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Team Member Filter */}
          <div>
            <select
              value={filters.teamMemberId}
              onChange={(e) => setFilters({ ...filters, teamMemberId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Members</option>
              {teamMembers.map(member => (
                <option key={member.Id} value={member.Id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Activity Type Filter */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="task_created">Task Created</option>
              <option value="task_updated">Task Updated</option>
              <option value="task_completed">Task Completed</option>
              <option value="comment_created">Comment Added</option>
              <option value="file_uploaded">File Uploaded</option>
              <option value="milestone_created">Milestone Created</option>
              <option value="milestone_completed">Milestone Completed</option>
              <option value="project_updated">Project Updated</option>
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        
        {hasFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-sm"
            >
              <ApperIcon name="X" size={14} />
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Activity Feed */}
      <div className="space-y-6">
        {Object.keys(groupedActivities).length === 0 ? (
          <Empty 
            message="No activities found"
            description={hasFilters ? "Try adjusting your filters to see more activities." : "Activities will appear here as team members work on projects."}
          />
        ) : (
          Object.entries(groupedActivities).map(([dateGroup, activities]) => (
            <div key={dateGroup}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Calendar" size={20} className="mr-2" />
                {dateGroup}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({activities.length} {activities.length === 1 ? 'activity' : 'activities'})
                </span>
              </h3>
              
              <div className="space-y-3">
                {activities.map((activity) => {
                  const typeInfo = activityService.getActivityTypeInfo(activity.type);
const handleActivityClick = () => {
                    if (activity.projectId && activity.taskId) {
                      // Navigate to task within project context (if we had task detail pages)
                      navigate(`/projects/${activity.projectId}`);
                    } else if (activity.projectId && activity.type.includes('project')) {
                      navigate(`/projects/${activity.projectId}`);
                    } else if (activity.projectId) {
                      navigate(`/projects/${activity.projectId}`);
                    }
                  };

                  const isClickable = activity.projectId || activity.taskId || activity.issueId;
                  
                  return (
                    <Card 
                      key={activity.Id} 
                      className={`p-4 transition-all duration-200 ${
                        isClickable 
                          ? 'hover:shadow-md hover:bg-gray-50 cursor-pointer' 
                          : 'hover:shadow-sm'
                      }`}
                      onClick={isClickable ? handleActivityClick : undefined}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeInfo.bgColor} flex items-center justify-center`}>
                          <ApperIcon name={typeInfo.icon} size={20} className={typeInfo.color} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {getTeamMemberName(activity.userId)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <p className={`text-sm mt-1 ${isClickable ? 'text-gray-700' : 'text-gray-600'}`}>
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                              {getActivityTypeDisplayName(activity.type)}
                            </span>
                            
                            {activity.projectId && (
                              <span className="text-xs text-gray-500">
                                in {getProjectName(activity.projectId)}
                              </span>
                            )}
                            
                            {isClickable && (
                              <span className="text-xs text-blue-600 font-medium">
                                Click to view →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;