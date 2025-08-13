import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { useNavigate } from 'react-router-dom';
import activityService from '@/services/api/activityService';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';

const RecentActivityPanel = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getRecentActivities();
      setActivities(data);
      
      const counts = await activityService.getActivityCounts();
      setUnreadCount(counts.unread);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  const handleActivityClick = async (activity) => {
    try {
      // Mark as read when clicked
      if (!activity.isRead) {
        await activityService.markAsRead(activity.Id);
        await loadActivities(); // Refresh to update counts
      }

      // Navigate to relevant page
      switch (activity.type) {
        case activityService.ACTIVITY_TYPES.TASK_CREATED:
        case activityService.ACTIVITY_TYPES.TASK_UPDATED:
        case activityService.ACTIVITY_TYPES.TASK_COMPLETED:
        case activityService.ACTIVITY_TYPES.TASK_ASSIGNED:
          if (activity.taskId) {
            navigate('/tasks');
          }
          break;
        case activityService.ACTIVITY_TYPES.COMMENT_CREATED:
        case activityService.ACTIVITY_TYPES.COMMENT_UPDATED:
          if (activity.projectId) {
            navigate(`/projects/${activity.projectId}`);
          }
          break;
        case activityService.ACTIVITY_TYPES.FILE_UPLOADED:
          if (activity.projectId) {
            navigate(`/projects/${activity.projectId}`);
          }
          break;
        case activityService.ACTIVITY_TYPES.MILESTONE_CREATED:
        case activityService.ACTIVITY_TYPES.MILESTONE_COMPLETED:
          if (activity.projectId) {
            navigate(`/projects/${activity.projectId}`);
          }
          break;
        case activityService.ACTIVITY_TYPES.PROJECT_CREATED:
        case activityService.ACTIVITY_TYPES.PROJECT_UPDATED:
          if (activity.projectId) {
            navigate(`/projects/${activity.projectId}`);
          } else {
            navigate('/projects');
          }
          break;
        case activityService.ACTIVITY_TYPES.TEAM_MEMBER_ADDED:
        case activityService.ACTIVITY_TYPES.USER_MENTIONED:
          navigate('/team');
          break;
        case activityService.ACTIVITY_TYPES.CHAT_MESSAGE:
          navigate('/chat');
          break;
        default:
          navigate('/activity-feed');
      }
    } catch (error) {
      console.error('Failed to handle activity click:', error);
      toast.error('Failed to open activity');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await activityService.markAllAsRead();
      await loadActivities();
      toast.success('All activities marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark activities as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await activityService.clearAll();
      await loadActivities();
      toast.success('All activities cleared');
    } catch (error) {
      console.error('Failed to clear activities:', error);
      toast.error('Failed to clear activities');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityTypeInfo = (type) => {
    return activityService.getActivityTypeInfo(type);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Toggle Button */}

      {/* Activity Panel */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 lg:w-96 bg-white shadow-2xl z-40",
        "transform transition-transform duration-300 ease-in-out",
        "border-l border-gray-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ApperIcon name="Activity" size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ApperIcon name="X" size={18} className="text-gray-500" />
            </button>
          </div>
          
          {/* Action Buttons */}
          {activities.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs"
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <ApperIcon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-sm text-gray-500">
                Start working on projects and tasks to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const typeInfo = getActivityTypeInfo(activity.type);
                return (
                  <div
                    key={activity.Id}
                    onClick={() => handleActivityClick(activity)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      "hover:bg-gray-50 hover:border-gray-300",
                      activity.isRead 
                        ? "bg-white border-gray-200" 
                        : "bg-blue-50 border-blue-200 shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full flex-shrink-0",
                        typeInfo.bgColor,
                        typeInfo.textColor
                      )}>
                        <ApperIcon name={typeInfo.icon} size={14} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={cn(
                            "text-sm font-medium leading-tight",
                            activity.isRead ? "text-gray-900" : "text-gray-900"
                          )}>
                            {activity.title}
                          </p>
                          {!activity.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        
                        {activity.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            typeInfo.bgColor,
                            typeInfo.textColor
                          )}>
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentActivityPanel;