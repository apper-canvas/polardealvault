import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import taskService from "@/services/api/taskService";
import timeEntryService from "@/services/api/timeEntryService";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import activityService from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import TimeEntryCard from "@/components/molecules/TimeEntryCard";
import TimeEntryForm from "@/components/molecules/TimeEntryForm";
import TaskForm from "@/components/molecules/TaskForm";
import CollaborationSection from "@/components/molecules/CollaborationSection";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import Card from "@/components/atoms/Card";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Core data state
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
  
  // Modal and UI states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editingTime, setEditingTime] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showCollaboration, setShowCollaboration] = useState(false);

  useEffect(() => {
    loadTaskData();
  }, [id]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [taskData, projectsData, taskTimeEntries] = await Promise.all([
        taskService.getById(parseInt(id)),
        projectService.getAll(),
        timeEntryService.getByTaskId(parseInt(id))
      ]);

      if (!taskData) {
        setError("Task not found");
        return;
      }

      setTask(taskData);
      setProjects(projectsData);
      setTimeEntries(taskTimeEntries);

      // Load related project and client data
      if (taskData.projectId) {
        const projectData = await projectService.getById(taskData.projectId);
        setProject(projectData);

        if (projectData?.clientId) {
          const clientData = await clientService.getById(projectData.clientId);
          setClient(clientData);
        }
      }
    } catch (err) {
      console.error("Error loading task:", err);
      setError("Failed to load task details");
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await taskService.update(task.Id, taskData);
      setTask(updatedTask);
      setShowEditModal(false);
      toast.success("Task updated successfully");

      await activityService.create({
        type: "task",
        action: "updated",
        description: `Task "${updatedTask.name}" was updated`,
        entityId: updatedTask.Id,
        projectId: updatedTask.projectId,
        userId: 1
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleToggleComplete = async () => {
    try {
      const newCompleted = !task.completed;
      const updatedTask = await taskService.update(task.Id, { 
        ...task, 
        completed: newCompleted 
      });
      setTask(updatedTask);
      
      toast.success(`Task ${newCompleted ? 'completed' : 'reopened'}`);

      await activityService.create({
        type: "task",
        action: newCompleted ? "completed" : "reopened",
        description: `Task "${updatedTask.name}" was ${newCompleted ? 'completed' : 'reopened'}`,
        entityId: updatedTask.Id,
        projectId: updatedTask.projectId,
        userId: 1
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      await taskService.delete(task.Id);
      toast.success("Task deleted successfully");

      await activityService.create({
        type: "task",
        action: "deleted",
        description: `Task "${task.name}" was deleted`,
        projectId: task.projectId,
        userId: 1
      });

      if (project) {
        navigate(`/projects/${project.Id}`);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleTimeSubmit = async (timeData) => {
    try {
      let timeEntry;
      if (editingTime) {
        timeEntry = await timeEntryService.update(editingTime.Id, {
          ...timeData,
          taskId: task.Id,
          projectId: task.projectId
        });
      } else {
        timeEntry = await timeEntryService.create({
          ...timeData,
          taskId: task.Id,
          projectId: task.projectId
        });
      }
      
      const updatedTimeEntries = await timeEntryService.getByTaskId(parseInt(id));
      setTimeEntries(updatedTimeEntries);
      
      setShowTimeModal(false);
      setEditingTime(null);
      
      toast.success(editingTime ? "Time entry updated successfully" : "Time entry logged successfully");

      await activityService.create({
        type: "time",
        action: editingTime ? "updated" : "logged",
        description: `${timeData.duration} hours ${editingTime ? 'updated' : 'logged'} for task "${task.name}"`,
        entityId: timeEntry.Id,
        projectId: task.projectId,
        userId: 1
      });
    } catch (error) {
      console.error("Error with time entry:", error);
      toast.error(editingTime ? "Failed to update time entry" : "Failed to log time entry");
    }
  };

  const handleDeleteTime = async (timeEntryId) => {
    if (!confirm("Are you sure you want to delete this time entry?")) {
      return;
    }

    try {
      await timeEntryService.delete(timeEntryId);
      const updatedTimeEntries = await timeEntryService.getByTaskId(parseInt(id));
      setTimeEntries(updatedTimeEntries);
      toast.success("Time entry deleted successfully");
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    }
  };

  const handleEditTime = (timeEntry) => {
    setEditingTime(timeEntry);
    setShowTimeModal(true);
  };

  const handleCloseTimeModal = () => {
    setShowTimeModal(false);
    setEditingTime(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'status-urgent';
      case 'Medium':
        return 'status-in-progress';
      case 'Low':
        return 'status-completed';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (completed) => {
    return completed ? 'status-completed' : 'status-in-progress';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const calculateTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTaskData} />;
  if (!task) return <Error message="Task not found" />;

  return (
    <div className="space-y-6">
      {/* Enhanced Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <button 
          onClick={() => navigate('/tasks')} 
          className="hover:text-gray-700 transition-colors focus:outline-none focus:text-gray-700"
          aria-label="Go to Tasks"
        >
          Tasks
        </button>
        {project && (
          <>
            <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
            <button 
              onClick={() => navigate(`/projects/${project.Id}`)}
              className="hover:text-gray-700 transition-colors focus:outline-none focus:text-gray-700"
              aria-label={`Go to project ${project.name}`}
            >
              {project.name}
            </button>
          </>
        )}
        <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium" aria-current="page">{task.name}</span>
      </nav>

      {/* Enhanced Task Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className={`text-2xl lg:text-3xl font-bold transition-colors ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.name}
              </h1>
              {task.priority && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.completed)}`}>
                {task.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* Project Context */}
            {project && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                <ApperIcon name="Folder" size={16} />
                <button 
                  onClick={() => navigate(`/projects/${project.Id}`)}
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  {project.name}
                </button>
                {client && (
                  <>
                    <span className="text-gray-400">•</span>
                    <button 
                      onClick={() => navigate(`/clients/${client.Id}`)}
                      className="hover:text-blue-600 transition-colors font-medium"
                    >
                      {client.name}
                    </button>
                  </>
                )}
              </div>
            )}

            {task.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch lg:min-w-[140px]">
            <Button
              variant="outline"
              onClick={() => setShowTimeModal(true)}
              className="flex items-center justify-center gap-2 flex-1 lg:flex-none"
            >
              <ApperIcon name="Clock" size={16} />
              Log Time
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center gap-2 flex-1 lg:flex-none"
            >
              <ApperIcon name="Edit" size={16} />
              Edit Task
            </Button>
            <Button
              variant={task.completed ? "outline" : "primary"}
              onClick={handleToggleComplete}
              className="flex items-center justify-center gap-2 flex-1 lg:flex-none"
            >
              <ApperIcon name={task.completed ? "RotateCcw" : "Check"} size={16} />
              {task.completed ? 'Reopen' : 'Complete'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteTask}
              className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 flex-1 lg:flex-none"
            >
              <ApperIcon name="Trash2" size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* Enhanced Task Details Grid */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <div className="flex items-center gap-2 text-gray-900">
                <ApperIcon name="Calendar" size={16} className="text-gray-400" />
                <span className="font-medium">{formatDate(task.startDate)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <div className="flex items-center gap-2 text-gray-900">
                <ApperIcon name="CalendarClock" size={16} className="text-gray-400" />
                <span className="font-medium">{formatDate(task.dueDate)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <div className="flex items-center gap-2 text-gray-900">
                <ApperIcon name="Plus" size={16} className="text-gray-400" />
                <span className="font-medium">{formatDate(task.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Total Time</h3>
              <div className="flex items-center gap-2">
                <ApperIcon name="Timer" size={16} className="text-blue-600" />
                <span className="font-bold text-blue-600">
                  {calculateTotalTime().toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Tab Navigation */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" role="tablist">
            {[
              { key: 'details', label: 'Details & Comments', icon: 'MessageSquare' },
              { key: 'time', label: 'Time Entries', icon: 'Clock' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                role="tab"
                aria-selected={activeTab === tab.key}
              >
                <ApperIcon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Enhanced Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <CollaborationSection 
                    taskId={task.Id}
                    projectId={task.projectId}
                    isExpanded={showCollaboration}
                    onToggle={() => setShowCollaboration(!showCollaboration)}
                  />
                </div>

                <div className="space-y-6">
                  {/* Task Information Card */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ApperIcon name="Info" size={16} />
                      Task Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Priority</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority || 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Status</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${getStatusColor(task.completed)}`}>
                          {task.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Time Remaining</span>
                          <span className="font-medium text-gray-900">
                            {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm pt-2 border-t">
                        <span className="text-gray-600">Total Time Logged</span>
                        <span className="font-bold text-blue-600">
                          {calculateTotalTime().toFixed(1)} hours
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Project Details Card */}
                  {project && (
                    <Card className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ApperIcon name="Folder" size={16} />
                        Project Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <button 
                            onClick={() => navigate(`/projects/${project.Id}`)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors block"
                          >
                            {project.name}
                          </button>
                          {project.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        {client && (
                          <div className="pt-3 border-t">
                            <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
                              Client
                            </span>
                            <button 
                              onClick={() => navigate(`/clients/${client.Id}`)}
                              className="block text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors mt-1"
                            >
                              {client.name}
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track and manage time spent on this task
                  </p>
                </div>
                <Button 
                  variant="primary"
                  onClick={() => setShowTimeModal(true)}
                  className="flex items-center gap-2 sm:w-auto"
                >
                  <ApperIcon name="Plus" size={16} />
                  Log Time
                </Button>
              </div>
              
              {timeEntriesLoading ? (
                <div className="flex justify-center py-12">
                  <Loading />
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <ApperIcon name="Clock" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No time entries yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start tracking time spent on this task to monitor progress and productivity
                  </p>
                  <Button 
                    variant="primary"
                    onClick={() => setShowTimeModal(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <ApperIcon name="Plus" size={16} />
                    Log Your First Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeEntries.map((entry) => (
                    <TimeEntryCard
                      key={entry.Id}
                      timeEntry={entry}
                      project={projects.find(p => p.Id === entry.projectId)}
                      onEdit={() => handleEditTime(entry)}
                      onDelete={() => handleDeleteTime(entry.Id)}
                    />
                  ))}
                  
                  {/* Time Summary */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ApperIcon name="BarChart3" size={20} className="text-blue-600" />
                          <span className="font-semibold text-gray-900">Total Time Logged:</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          {calculateTotalTime().toFixed(1)} hours
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
      >
        <TaskForm
          task={task}
          projects={projects}
          onSubmit={handleEditTask}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal 
        isOpen={showTimeModal} 
        onClose={handleCloseTimeModal}
        title={editingTime ? "Edit Time Entry" : "Log Time Entry"}
      >
        <TimeEntryForm
          projects={projects}
          timeEntry={editingTime || {
            projectId: task.projectId,
            taskId: task.Id,
            description: `Work on ${task.name}`
          }}
          onSubmit={handleTimeSubmit}
          onCancel={handleCloseTimeModal}
        />
      </Modal>
    </div>
  );
};

export default TaskDetail;