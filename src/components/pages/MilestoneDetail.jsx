import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import projectService from '@/services/api/projectService';
import taskListService from '@/services/api/taskListService';
import taskService from '@/services/api/taskService';
import clientService from '@/services/api/clientService';
import activityService from '@/services/api/activityService';
import timeEntryService from '@/services/api/timeEntryService';
import ApperIcon from '@/components/ApperIcon';
import TimeEntryCard from '@/components/molecules/TimeEntryCard';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Modal from '@/components/atoms/Modal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import TaskListCard from '@/components/molecules/TaskListCard';
import TaskListForm from '@/components/molecules/TaskListForm';
import TaskForm from '@/components/molecules/TaskForm';
import MilestoneForm from '@/components/molecules/MilestoneForm';

function MilestoneDetail() {
  const navigate = useNavigate();
  const { projectId, id } = useParams();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [project, setProject] = useState(null);
  const [taskLists, setTaskLists] = useState([]);
  const [tasks, setTasks] = useState([]);
const [activities, setActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  // Modal states
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [showTaskListModal, setShowTaskListModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskList, setEditingTaskList] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskList, setSelectedTaskList] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadMilestoneData();
  }, [projectId, id]);

  async function loadMilestoneData() {
    try {
      setLoading(true);
      setError(null);

      // Load project and milestone data
const [projectData, allMilestones, allTaskLists, allTasks, clientsData, allTimeEntries] = await Promise.all([
        projectService.getById(parseInt(projectId)),
        projectService.getMilestonesByProjectId(parseInt(projectId)),
        taskListService.getAll(),
        taskService.getAll(),
        clientService.getAll(),
        timeEntryService.getAll()
      ]);

      const currentMilestone = allMilestones.find(m => m.Id === parseInt(id));
      
      if (!currentMilestone) {
        throw new Error('Milestone not found');
      }

      // Filter task lists and tasks for this milestone
      const milestoneTaskLists = allTaskLists.filter(tl => tl.milestoneId === currentMilestone.Id);
      const taskListIds = milestoneTaskLists.map(tl => tl.Id);
      const milestoneTasks = allTasks.filter(task => 
        taskListIds.some(tlId => {
          const taskList = milestoneTaskLists.find(tl => tl.Id === tlId);
          return taskList && taskList.tasks && taskList.tasks.includes(task.Id);
        })
      );

      // Filter time entries for milestone tasks
      const milestoneTimeEntries = allTimeEntries.filter(entry => 
        milestoneTasks.some(task => task.Id === entry.taskId)
      );

      // Load recent activities
      const recentActivities = await activityService.getAll();
      const milestoneActivities = recentActivities
        .filter(activity => 
          activity.entityType === 'milestone' && activity.entityId === currentMilestone.Id ||
          activity.entityType === 'task' && milestoneTasks.some(task => task.Id === activity.entityId) ||
          activity.entityType === 'taskList' && milestoneTaskLists.some(tl => tl.Id === activity.entityId)
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setProject(projectData);
      setMilestone(currentMilestone);
      setTaskLists(milestoneTaskLists);
      setTasks(milestoneTasks);
      setActivities(milestoneActivities);
      setClients(clientsData);
      setTimeEntries(milestoneTimeEntries);
      
    } catch (err) {
      console.error('Error loading milestone data:', err);
      setError('Failed to load milestone data');
      toast.error('Failed to load milestone data');
    } finally {
      setLoading(false);
    }
  }

  // Milestone operations
  async function handleEditMilestone(milestoneData) {
    try {
      const updatedMilestone = await projectService.updateMilestone(milestone.Id, milestoneData);
      setMilestone(updatedMilestone);
      toast.success('Milestone updated successfully');
      closeModals();
    } catch (err) {
      console.error('Error updating milestone:', err);
      toast.error('Failed to update milestone');
    }
  }

  async function handleDeleteMilestone() {
    if (!confirm('Are you sure you want to delete this milestone? This will also remove all associated task lists and tasks.')) {
      return;
    }
    
    try {
      await projectService.deleteMilestone(milestone.Id);
      toast.success('Milestone deleted successfully');
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error('Error deleting milestone:', err);
      toast.error('Failed to delete milestone');
    }
  }

  async function handleToggleMilestoneComplete(isCompleted) {
    try {
      const updatedMilestone = await projectService.updateMilestone(milestone.Id, {
        ...milestone,
        isCompleted
      });
      setMilestone(updatedMilestone);
      toast.success(isCompleted ? 'Milestone marked as completed' : 'Milestone marked as in progress');
    } catch (err) {
      console.error('Error updating milestone status:', err);
      toast.error('Failed to update milestone status');
    }
  }

  // Task List operations
  async function handleCreateTaskList(taskListData) {
    try {
      const newTaskList = await taskListService.create({
        ...taskListData,
        projectId: project.Id,
        milestoneId: milestone.Id
      });
      setTaskLists(prev => [...prev, newTaskList]);
      toast.success('Task list created successfully');
      closeModals();
    } catch (err) {
      console.error('Error creating task list:', err);
      toast.error('Failed to create task list');
    }
  }

  async function handleEditTaskList(taskListData) {
    try {
      const updatedTaskList = await taskListService.update(editingTaskList.Id, taskListData);
      setTaskLists(prev => prev.map(tl => tl.Id === updatedTaskList.Id ? updatedTaskList : tl));
      toast.success('Task list updated successfully');
      closeModals();
    } catch (err) {
      console.error('Error updating task list:', err);
      toast.error('Failed to update task list');
    }
  }

  async function handleDeleteTaskList(taskListId) {
    if (!confirm('Are you sure you want to delete this task list and all its tasks?')) {
      return;
    }
    
    try {
      await taskListService.delete(taskListId);
      setTaskLists(prev => prev.filter(tl => tl.Id !== taskListId));
      setTasks(prev => prev.filter(task => {
        const taskList = taskLists.find(tl => tl.Id === taskListId);
        return !taskList?.tasks?.includes(task.Id);
      }));
      toast.success('Task list deleted successfully');
    } catch (err) {
      console.error('Error deleting task list:', err);
      toast.error('Failed to delete task list');
    }
  }

  // Task operations
  async function handleCreateTask(taskData) {
    try {
      const newTask = await taskService.create({
        ...taskData,
        projectId: project.Id
      });
      
      if (taskData.taskListId) {
        const taskList = taskLists.find(tl => tl.Id === taskData.taskListId);
        if (taskList) {
          const updatedTaskList = await taskListService.update(taskList.Id, {
            ...taskList,
            tasks: [...(taskList.tasks || []), newTask.Id]
          });
          setTaskLists(prev => prev.map(tl => tl.Id === updatedTaskList.Id ? updatedTaskList : tl));
        }
      }
      
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created successfully');
      closeModals();
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    }
  }

  async function handleEditTask(taskData) {
    try {
      const updatedTask = await taskService.update(editingTask.Id, taskData);
      setTasks(prev => prev.map(task => task.Id === updatedTask.Id ? updatedTask : task));
      toast.success('Task updated successfully');
      closeModals();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await taskService.delete(taskId);
      
      // Remove task from task lists
      const updatedTaskLists = await Promise.all(
        taskLists.map(async (taskList) => {
          if (taskList.tasks && taskList.tasks.includes(taskId)) {
            const updatedTaskList = await taskListService.update(taskList.Id, {
              ...taskList,
              tasks: taskList.tasks.filter(id => id !== taskId)
            });
            return updatedTaskList;
          }
          return taskList;
        })
      );
      
      setTaskLists(updatedTaskLists);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  }

  async function handleToggleTaskComplete(taskId) {
    try {
      const task = tasks.find(t => t.Id === taskId);
      const updatedTask = await taskService.update(taskId, {
        ...task,
        completed: !task.completed
      });
      setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t));
      toast.success(`Task ${updatedTask.completed ? 'completed' : 'reopened'}`);
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  }

  // Modal functions
  function openEditMilestoneModal() {
    setShowEditMilestoneModal(true);
  }

  function openCreateTaskListModal() {
    setEditingTaskList(null);
    setShowTaskListModal(true);
  }

  function openEditTaskListModal(taskList) {
    setEditingTaskList(taskList);
    setShowTaskListModal(true);
  }

  function openCreateTaskModal(taskList = null) {
    setEditingTask(null);
    setSelectedTaskList(taskList);
    setShowTaskModal(true);
  }

  function openEditTaskModal(task) {
    setEditingTask(task);
    setSelectedTaskList(null);
    setShowTaskModal(true);
  }

  function closeModals() {
    setShowEditMilestoneModal(false);
    setShowTaskListModal(false);
    setShowTaskModal(false);
    setEditingTaskList(null);
    setEditingTask(null);
    setSelectedTaskList(null);
  }

  // Helper functions
  function getMilestoneStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate,
      totalTaskLists: taskLists.length
    };
  }

  function getMilestoneStatus() {
    const dueDate = new Date(milestone.dueDate);
    const today = new Date();
    const isOverdue = isAfter(startOfDay(today), startOfDay(dueDate)) && !milestone.isCompleted;
    
    if (milestone.isCompleted) {
      return { status: 'Completed', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200' };
    } else if (isOverdue) {
      return { status: 'Overdue', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200' };
    } else {
      return { status: 'In Progress', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' };
    }
  }

  function formatDate(dateString) {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!milestone || !project) return <Error message="Milestone not found" />;

  const stats = getMilestoneStats();
  const statusInfo = getMilestoneStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => navigate('/projects')}
            className="hover:text-gray-900 transition-colors"
          >
            Projects
          </button>
          <ApperIcon name="ChevronRight" size={14} />
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="hover:text-gray-900 transition-colors"
          >
            {project.name}
          </button>
          <ApperIcon name="ChevronRight" size={14} />
          <span className="text-gray-900 font-medium">
            {milestone.title}
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">{milestone.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}>
                  {statusInfo.status}
                </span>
              </div>
              
              {milestone.description && (
                <p className="text-gray-600 mb-4">{milestone.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Calendar" size={16} />
                  <span>Due: {formatDate(milestone.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="List" size={16} />
                  <span>{stats.totalTaskLists} task lists</span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="CheckSquare" size={16} />
                  <span>{stats.totalTasks} tasks ({stats.completedTasks} completed)</span>
                </div>
              </div>

              {stats.totalTasks > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="milestone-progress-bar h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleMilestoneComplete(!milestone.isCompleted)}
                className={`p-2 ${milestone.isCompleted ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                title={milestone.isCompleted ? 'Mark as in progress' : 'Mark as completed'}
              >
                <ApperIcon name={milestone.isCompleted ? "RotateCcw" : "Check"} size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openEditMilestoneModal}
                className="p-2"
                title="Edit milestone"
              >
                <ApperIcon name="Edit2" size={16} className="text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteMilestone}
                className="p-2 text-red-600 hover:text-red-700"
                title="Delete milestone"
              >
                <ApperIcon name="Trash2" size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <div className="flex space-x-8">
{['overview', 'timeline', 'activity', 'time'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'time' ? 'Time Spent' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ApperIcon name="CheckSquare" size={24} className="text-blue-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <ApperIcon name="CheckCircle" size={24} className="text-green-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <ApperIcon name="Clock" size={24} className="text-yellow-600" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Task Lists</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalTaskLists}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <ApperIcon name="List" size={24} className="text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Task Lists */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Task Lists</h2>
                <Button onClick={openCreateTaskListModal} variant="primary">
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Task List
                </Button>
              </div>

              {taskLists.length === 0 ? (
                <Empty
                  icon="List"
                  title="No task lists yet"
                  description="Create task lists to organize tasks within this milestone."
                  actionLabel="Add First Task List"
                  onAction={openCreateTaskListModal}
                />
              ) : (
                <div className="space-y-4">
                  {taskLists.map((taskList) => (
                    <TaskListCard
                      key={taskList.Id}
                      taskList={taskList}
                      tasks={tasks}
                      project={project}
                      onEdit={openEditTaskListModal}
                      onDelete={handleDeleteTaskList}
                      onAddTask={openCreateTaskModal}
                      onEditTask={openEditTaskModal}
                      onDeleteTask={handleDeleteTask}
                      onToggleTaskComplete={handleToggleTaskComplete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Timeline View</h2>
            </div>
            
            <Card className="p-6">
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <Empty
                    icon="Calendar"
                    title="No tasks to display"
                    description="Add task lists and tasks to see them in timeline view."
                  />
                ) : (
                  <div className="space-y-3">
                    {tasks
                      .sort((a, b) => {
                        if (a.startDate && b.startDate) {
                          return new Date(a.startDate) - new Date(b.startDate);
                        }
                        return a.title.localeCompare(b.title);
                      })
                      .map((task) => (
                        <div key={task.Id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </h4>
                            {(task.startDate || task.dueDate) && (
                              <p className="text-sm text-gray-600">
                                {task.startDate && formatDate(task.startDate)}
                                {task.startDate && task.dueDate && ' → '}
                                {task.dueDate && formatDate(task.dueDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {task.priority || 'normal'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            
            <Card className="p-6">
              {activities.length === 0 ? (
                <Empty
                  icon="Activity"
                  title="No activity yet"
                  description="Activity related to this milestone will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.Id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ApperIcon name="Activity" size={14} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
)}

        {/* Time Spent Tab */}
        {activeTab === 'time' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
              <div className="text-sm text-gray-600">
                Total: {timeEntries.reduce((total, entry) => total + entry.duration, 0).toFixed(1)} hours
              </div>
            </div>
            
            {timeEntries.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="Clock" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No time entries yet</h3>
                <p className="text-gray-600">Time entries will appear here when tasks in this milestone are worked on</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeEntries.map((entry) => {
                  const task = tasks.find(t => t.Id === entry.taskId);
                  return (
                    <div key={entry.Id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{entry.description}</h4>
                          {task && (
                            <p className="text-sm text-gray-600 mt-1">
                              Task: {task.title}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-semibold text-blue-600">
                            {entry.duration.toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(parseISO(entry.date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Time Spent:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {timeEntries.reduce((total, entry) => total + entry.duration, 0).toFixed(1)} hours
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
      {/* Edit Milestone Modal */}
      <Modal
        isOpen={showEditMilestoneModal}
        onClose={closeModals}
        title="Edit Milestone"
        className="max-w-lg"
      >
        <MilestoneForm
          milestone={milestone}
          onSubmit={handleEditMilestone}
          onCancel={closeModals}
        />
      </Modal>

      {/* Create/Edit Task List Modal */}
      <Modal
        isOpen={showTaskListModal}
        onClose={closeModals}
        title={editingTaskList ? "Edit Task List" : "Create New Task List"}
        className="max-w-lg"
      >
        <TaskListForm
          taskList={editingTaskList}
          milestones={[milestone]}
          onSubmit={editingTaskList ? handleEditTaskList : handleCreateTaskList}
          onCancel={closeModals}
        />
      </Modal>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={closeModals}
        title={editingTask ? "Edit Task" : "Create New Task"}
        className="max-w-lg"
      >
        <TaskForm
          task={editingTask}
          projects={[project]}
          milestones={[milestone]}
          taskLists={taskLists}
          selectedTaskList={selectedTaskList}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={closeModals}
        />
      </Modal>
    </div>
  );
}

export default MilestoneDetail;