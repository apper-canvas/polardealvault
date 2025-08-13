import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import taskService from '@/services/api/taskService';
import projectService from '@/services/api/projectService';

const TodaysTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodaysTasks();
  }, []);

  const loadTodaysTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [allTasks, allProjects] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Filter for today's tasks and overdue tasks
      const todayAndOverdueTasks = allTasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDate === today || new Date(task.dueDate) < new Date(today);
      });
      
      // Sort by due date (overdue first, then today's)
      const sortedTasks = todayAndOverdueTasks.sort((a, b) => {
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      
      setTasks(sortedTasks);
      setProjects(allProjects);
    } catch (err) {
      console.error('Failed to load today\'s tasks:', err);
      setError('Failed to load today\'s tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      await taskService.markComplete(taskId);
      
      // Update local state to remove completed task
      setTasks(prevTasks => prevTasks.filter(task => task.Id !== taskId));
      
      toast.success('Task marked as complete!');
    } catch (err) {
      console.error('Failed to mark task complete:', err);
      toast.error('Failed to mark task complete. Please try again.');
    }
  };

  const getProject = (projectId) => {
    return projects.find(p => p.Id === projectId);
  };

  const isOverdue = (dueDate) => {
    const today = new Date().toISOString().split('T')[0];
    return new Date(dueDate) < new Date(today);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTodaysTasks} size="sm">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
          <ApperIcon name="Calendar" size={20} className="text-gray-400" />
        </div>
        <div className="text-center py-8">
          <ApperIcon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
          <p className="text-gray-600">All caught up! No tasks due today or overdue.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
          <ApperIcon name="Calendar" size={20} className="text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-4">
        {tasks.map(task => {
          const project = getProject(task.projectId);
          const overdue = isOverdue(task.dueDate);
          
          return (
            <div
              key={task.Id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                overdue 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => handleMarkComplete(task.Id)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-green-400 flex items-center justify-center transition-colors hover:bg-green-50"
                  >
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      {overdue && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {project && (
                        <div className="flex items-center">
                          <ApperIcon name="Briefcase" size={12} className="mr-1" />
                          {project.name}
                        </div>
                      )}
                      <div className={`flex items-center ${overdue ? 'text-red-600 font-medium' : ''}`}>
                        <ApperIcon name="Calendar" size={12} className="mr-1" />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                        {overdue && (
                          <ApperIcon name="AlertCircle" size={12} className="ml-1 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleMarkComplete(task.Id)}
                  variant="primary"
                  size="sm"
                  className="ml-4"
                >
                  <ApperIcon name="Check" size={14} className="mr-1" />
                  Complete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TodaysTasks;