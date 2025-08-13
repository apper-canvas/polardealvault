import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { addDays, addMonths, differenceInDays, endOfDay, endOfMonth, endOfWeek, format, formatDistanceToNow, getDay, isFuture, isPast, isSameDay, isSameMonth, isToday, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { create as createIssue, getAll as getAllIssues, getById as getIssueById, update as updateIssue } from "@/services/api/issueService";
import taskService from "@/services/api/taskService";
import timeEntryService from "@/services/api/timeEntryService";
import clientService from "@/services/api/clientService";
import taskListService from "@/services/api/taskListService";
import projectService from "@/services/api/projectService";
import teamMemberService from "@/services/api/teamMemberService";
import activityService from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import TaskListCard from "@/components/molecules/TaskListCard";
import MilestoneCard from "@/components/molecules/MilestoneCard";
import TaskListForm from "@/components/molecules/TaskListForm";
import WikiDocumentForm from "@/components/molecules/WikiDocumentForm";
import CalendarEventForm from "@/components/molecules/CalendarEventForm";
import TaskForm from "@/components/molecules/TaskForm";
import ProjectForm from "@/components/molecules/ProjectForm";
import ChatChannel from "@/components/molecules/ChatChannel";
import TaskCard from "@/components/molecules/TaskCard";
import MilestoneForm from "@/components/molecules/MilestoneForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Tasks from "@/components/pages/Tasks";
import Dashboard from "@/components/pages/Dashboard";
import Projects from "@/components/pages/Projects";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import Card from "@/components/atoms/Card";
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectTimeEntries, setProjectTimeEntries] = useState([]);
  
const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [clients, setClients] = useState([]);
const [tasks, setTasks] = useState([]);
  const [taskLists, setTaskLists] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskListModal, setShowTaskListModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskList, setEditingTaskList] = useState(null);
  const [selectedTaskList, setSelectedTaskList] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
const [activeTab, setActiveTab] = useState('dashboard');
const [draggedTask, setDraggedTask] = useState(null);
const [dragOverColumn, setDragOverColumn] = useState(null);
  const [wikiDocuments, setWikiDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [editingWikiDoc, setEditingWikiDoc] = useState(null);
  const [wikiContent, setWikiContent] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
const [teamMembers, setTeamMembers] = useState([]);
const [activities, setActivities] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [timelineView, setTimelineView] = useState('gantt'); // gantt or calendar
  const [timelineStart, setTimelineStart] = useState(() => {
    // Set default start to beginning of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const timelineRef = useRef(null);
const loadProjectData = async () => {
    try {
      setLoading(true);
      setError("");
      
const [projectData, tasksData, taskListsData, clientsData, projectsData, milestonesData, wikiData, eventsData, teamData, activitiesData, timeEntriesData] = await Promise.all([
        projectService.getById(id),
        taskService.getByProjectId(id),
        taskListService.getByProjectId(id),
        clientService.getAll(),
        projectService.getAll(),
        projectService.getMilestonesByProjectId(id),
        projectService.getWikiDocuments(id),
        projectService.getCalendarEvents(id),
teamMemberService.getAll(),
activityService.getByProjectId(parseInt(id)),
timeEntryService.getByProjectId(parseInt(id))
      ]);
setProject(projectData);
      setMilestones(milestonesData || []);
setTasks(tasksData);
      setTaskLists(taskListsData || []);
      setClients(clientsData);
      setProjects(projectsData);
      setWikiDocuments(wikiData || []);
      setCalendarEvents(eventsData || []);
      setTeamMembers(teamData || []);
setActivities(activitiesData || []);
      setTimeEntries(timeEntriesData || []);
      // Find the client for this project
      const projectClient = clientsData.find(c => c.Id === projectData.clientId);
      setClient(projectClient);
    } catch (err) {
      console.error("Failed to load project data:", err);
      setError("Failed to load project information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

const handleEditProject = async (projectData) => {
    try {
      const updatedProject = await projectService.update(project.Id, projectData);
      setProject(updatedProject);
      
      // Update client if changed
      const newClient = clients.find(c => c.Id === updatedProject.clientId);
      setClient(newClient);
      
      setShowEditModal(false);
      toast.success("Project updated successfully!");
    } catch (err) {
      console.error("Failed to update project:", err);
      toast.error("Failed to update project. Please try again.");
    }
  };

const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create({
        ...taskData,
        projectId: project.Id
      });
      
      // Add task to the selected task list
      if (selectedTaskList) {
        await taskListService.addTaskToList(selectedTaskList.Id, newTask.Id);
        setTaskLists(prev => 
          prev.map(tl => 
            tl.Id === selectedTaskList.Id 
              ? { ...tl, tasks: [...tl.tasks, newTask.Id] }
              : tl
          )
        );
      }
      
      setTasks(prev => [...prev, newTask]);
      setShowTaskModal(false);
      setSelectedTaskList(null);
      toast.success("Task created successfully!");
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Failed to create task. Please try again.");
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await taskService.update(editingTask.Id, taskData);
      setTasks(prev => 
        prev.map(task => 
          task.Id === editingTask.Id ? updatedTask : task
        )
      );
      setShowTaskModal(false);
      setEditingTask(null);
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task. Please try again.");
    }
};

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.delete(taskId);
        
        // Remove task from task lists
        setTaskLists(prev => 
          prev.map(tl => ({
            ...tl,
            tasks: tl.tasks.filter(id => id !== taskId)
          }))
        );
        
        setTasks(prev => prev.filter(task => task.Id !== taskId));
        toast.success("Task deleted successfully!");
      } catch (err) {
        console.error("Failed to delete task:", err);
        toast.error("Failed to delete task. Please try again.");
      }
    }
  };

  // Kanban drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask) return;
    
    const newCompleted = targetStatus === 'completed';
    if (draggedTask.completed === newCompleted) {
      setDraggedTask(null);
      return;
    }

    try {
      const updatedTask = await taskService.update(draggedTask.Id, {
        completed: newCompleted,
        status: targetStatus
      });
      
      setTasks(prev => 
        prev.map(task => 
          task.Id === draggedTask.Id ? updatedTask : task
        )
      );
      
      toast.success(`Task moved to ${targetStatus === 'completed' ? 'Completed' : targetStatus === 'inprogress' ? 'In Progress' : 'To Do'}!`);
    } catch (err) {
      console.error("Failed to update task status:", err);
      toast.error("Failed to update task status. Please try again.");
    }
    
    setDraggedTask(null);
  };

  const getKanbanColumns = () => {
    const todoTasks = tasks.filter(task => !task.completed && (!task.status || task.status === 'todo'));
    const inProgressTasks = tasks.filter(task => !task.completed && task.status === 'inprogress');
    const completedTasks = tasks.filter(task => task.completed);

    return [
      {
        id: 'todo',
        title: 'To Do',
        tasks: todoTasks,
        color: 'bg-gray-50 border-gray-200',
        headerColor: 'bg-gray-100 text-gray-700'
      },
      {
        id: 'inprogress',
        title: 'In Progress',
        tasks: inProgressTasks,
        color: 'bg-blue-50 border-blue-200',
        headerColor: 'bg-blue-100 text-blue-700'
      },
      {
        id: 'completed',
        title: 'Completed',
        tasks: completedTasks,
        color: 'bg-green-50 border-green-200',
        headerColor: 'bg-green-100 text-green-700'
      }
    ];
  };

// Task List handlers
  const handleCreateTaskList = async (taskListData) => {
    try {
      const newTaskList = await taskListService.create({
        ...taskListData,
        projectId: project.Id
      });
      setTaskLists(prev => [...prev, newTaskList]);
      setShowTaskListModal(false);
      toast.success("Task list created successfully!");
    } catch (err) {
      console.error("Failed to create task list:", err);
      toast.error("Failed to create task list. Please try again.");
    }
  };

  const handleEditTaskList = async (taskListData) => {
    try {
      const updatedTaskList = await taskListService.update(editingTaskList.Id, taskListData);
      setTaskLists(prev => 
        prev.map(tl => 
          tl.Id === editingTaskList.Id ? updatedTaskList : tl
        )
      );
      setShowTaskListModal(false);
      setEditingTaskList(null);
      toast.success("Task list updated successfully!");
    } catch (err) {
      console.error("Failed to update task list:", err);
      toast.error("Failed to update task list. Please try again.");
    }
  };

  const handleDeleteTaskList = async (taskListId) => {
    if (window.confirm("Are you sure you want to delete this task list? All tasks in this list will also be deleted.")) {
      try {
        const taskList = taskLists.find(tl => tl.Id === taskListId);
        
        // Delete all tasks in the list
        if (taskList && taskList.tasks.length > 0) {
          await Promise.all(taskList.tasks.map(taskId => taskService.delete(taskId)));
          setTasks(prev => prev.filter(task => !taskList.tasks.includes(task.Id)));
        }
        
        // Delete the task list
        await taskListService.delete(taskListId);
        setTaskLists(prev => prev.filter(tl => tl.Id !== taskListId));
        toast.success("Task list deleted successfully!");
      } catch (err) {
        console.error("Failed to delete task list:", err);
        toast.error("Failed to delete task list. Please try again.");
      }
    }
  };

const handleCreateMilestone = async (milestoneData) => {
    try {
      const newMilestone = await projectService.createMilestone(project.Id, milestoneData);
      setMilestones(prev => [...prev, newMilestone]);
      setShowMilestoneModal(false);
      toast.success("Milestone created successfully!");
    } catch (err) {
      console.error("Failed to create milestone:", err);
      toast.error("Failed to create milestone. Please try again.");
    }
  };

  const handleEditMilestone = async (milestoneData) => {
    try {
      const updatedMilestone = await projectService.updateMilestone(editingMilestone.Id, milestoneData);
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.Id === editingMilestone.Id ? updatedMilestone : milestone
        )
      );
      setShowMilestoneModal(false);
      setEditingMilestone(null);
      toast.success("Milestone updated successfully!");
    } catch (err) {
      console.error("Failed to update milestone:", err);
      toast.error("Failed to update milestone. Please try again.");
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (window.confirm("Are you sure you want to delete this milestone? All task lists and tasks in this milestone will also be deleted.")) {
      try {
        // Delete all task lists and tasks in this milestone
        const milestoneTaskLists = taskLists.filter(tl => tl.milestoneId === milestoneId);
        for (const taskList of milestoneTaskLists) {
          // Delete all tasks in each task list
          if (taskList.tasks.length > 0) {
            await Promise.all(taskList.tasks.map(taskId => taskService.delete(taskId)));
          }
          // Delete the task list
          await taskListService.delete(taskList.Id);
        }
        
        // Delete the milestone
        await projectService.deleteMilestone(milestoneId);
        
        // Update state
        const taskIdsToRemove = milestoneTaskLists.flatMap(tl => tl.tasks);
        setTasks(prev => prev.filter(task => !taskIdsToRemove.includes(task.Id)));
        setTaskLists(prev => prev.filter(tl => tl.milestoneId !== milestoneId));
        setMilestones(prev => prev.filter(milestone => milestone.Id !== milestoneId));
        
        toast.success("Milestone deleted successfully!");
      } catch (err) {
        console.error("Failed to delete milestone:", err);
        toast.error("Failed to delete milestone. Please try again.");
      }
    }
  };

  const handleToggleMilestoneComplete = async (milestoneId, isCompleted) => {
    try {
      const milestone = milestones.find(m => m.Id === milestoneId);
      const updatedMilestone = await projectService.updateMilestone(milestoneId, {
        ...milestone,
        isCompleted,
        completedDate: isCompleted ? new Date().toISOString() : null
      });
      setMilestones(prev => 
        prev.map(m => m.Id === milestoneId ? updatedMilestone : m)
      );
      toast.success(`Milestone ${isCompleted ? 'completed' : 'reopened'}!`);
    } catch (err) {
      console.error("Failed to update milestone:", err);
toast.error("Failed to update milestone. Please try again.");
    }
  };

  const handleTimelineTaskUpdate = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.update(taskId, updates);
      setTasks(prev => 
        prev.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      );
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };
const openEditModal = () => {
setShowEditModal(true);
  };

  const openCreateTaskModal = (taskList = null) => {
    setEditingTask(null);
    setSelectedTaskList(taskList);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
setShowTaskModal(true);
  };

  const openCreateTaskListModal = () => {
    setEditingTaskList(null);
    setShowTaskListModal(true);
  };

const openEditTaskListModal = (taskList) => {
    setEditingTaskList(taskList);
    setShowTaskListModal(true);
  };

  const handleToggleTaskComplete = async (taskId) => {
    try {
      const taskToUpdate = tasks.find(t => t.Id === taskId);
      const updatedTask = await taskService.update(taskId, {
        ...taskToUpdate,
        completed: !taskToUpdate.completed
      });
      setTasks(prev => 
        prev.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      );
      toast.success(updatedTask.completed ? "Task marked as completed!" : "Task marked as pending!");
    } catch (err) {
      console.error("Failed to toggle task:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };

const openCreateMilestoneModal = () => {
    setEditingMilestone(null);
    setShowMilestoneModal(true);
  };

  const openEditMilestoneModal = (milestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneModal(true);
  };

const closeModals = () => {
    setShowEditModal(false);
    setShowTaskModal(false);
    setShowTaskListModal(false);
    setShowMilestoneModal(false);
    setShowWikiModal(false);
    setShowEventModal(false);
    setEditingTask(null);
    setEditingTaskList(null);
    setSelectedTaskList(null);
    setEditingMilestone(null);
    setEditingWikiDoc(null);
    setEditingEvent(null);
    setSelectedDocument(null);
  };

  // Wiki document handlers
  const handleCreateWikiDocument = async (docData) => {
    try {
      const newDoc = await projectService.createWikiDocument(id, {
        ...docData,
        content: wikiContent,
        authorId: 1 // Current user ID
      });
      setWikiDocuments(prev => [...prev, newDoc]);
      toast.success("Wiki document created successfully!");
      closeModals();
      setWikiContent('');
    } catch (err) {
      console.error("Failed to create wiki document:", err);
      toast.error("Failed to create wiki document. Please try again.");
    }
  };

  const handleEditWikiDocument = async (docData) => {
    try {
      const updatedDoc = await projectService.updateWikiDocument(editingWikiDoc.Id, {
        ...docData,
        content: wikiContent
      });
      setWikiDocuments(prev => 
        prev.map(doc => doc.Id === editingWikiDoc.Id ? updatedDoc : doc)
      );
      if (selectedDocument && selectedDocument.Id === editingWikiDoc.Id) {
        setSelectedDocument(updatedDoc);
      }
      toast.success("Wiki document updated successfully!");
      closeModals();
      setWikiContent('');
    } catch (err) {
      console.error("Failed to update wiki document:", err);
      toast.error("Failed to update wiki document. Please try again.");
    }
  };

  const handleDeleteWikiDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await projectService.deleteWikiDocument(docId);
      setWikiDocuments(prev => prev.filter(doc => doc.Id !== docId));
      if (selectedDocument && selectedDocument.Id === docId) {
        setSelectedDocument(null);
      }
      toast.success("Wiki document deleted successfully!");
    } catch (err) {
      console.error("Failed to delete wiki document:", err);
      toast.error("Failed to delete wiki document. Please try again.");
    }
  };

  // Calendar event handlers
  const handleCreateCalendarEvent = async (eventData) => {
    try {
      const newEvent = await projectService.createCalendarEvent(id, {
        ...eventData,
        createdBy: 1 // Current user ID
      });
      setCalendarEvents(prev => [...prev, newEvent]);
      toast.success("Calendar event created successfully!");
      closeModals();
    } catch (err) {
      console.error("Failed to create calendar event:", err);
      toast.error("Failed to create calendar event. Please try again.");
    }
  };

  const handleEditCalendarEvent = async (eventData) => {
    try {
      const updatedEvent = await projectService.updateCalendarEvent(editingEvent.Id, eventData);
      setCalendarEvents(prev => 
        prev.map(event => event.Id === editingEvent.Id ? updatedEvent : event)
      );
      toast.success("Calendar event updated successfully!");
      closeModals();
    } catch (err) {
      console.error("Failed to update calendar event:", err);
      toast.error("Failed to update calendar event. Please try again.");
    }
  };

  const handleDeleteCalendarEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await projectService.deleteCalendarEvent(eventId);
      setCalendarEvents(prev => prev.filter(event => event.Id !== eventId));
      toast.success("Calendar event deleted successfully!");
    } catch (err) {
      console.error("Failed to delete calendar event:", err);
      toast.error("Failed to delete calendar event. Please try again.");
    }
  };

  const openCreateWikiModal = () => {
    setEditingWikiDoc(null);
    setWikiContent('');
    setShowWikiModal(true);
  };

  const openEditWikiModal = (doc) => {
    setEditingWikiDoc(doc);
    setWikiContent(doc.content || '');
    setShowWikiModal(true);
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const getStatusColor = (status) => {
switch (status) {
      case 'Planning': return 'status-in-progress';
      case 'In Progress': return 'status-in-progress';
      case 'Review': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'On Hold': return 'status-on-hold';
      default: return 'status-on-hold';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString();
};

  const renderActivitySection = () => {
    const recentActivities = activities.slice(0, 10);
    
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="Activity" size={20} className="mr-2" />
            Recent Activity
          </h3>
          <Button
            variant="outline"
            onClick={() => navigate('/activity-feed', { state: { projectId: project.Id } })}
            className="text-sm"
          >
            View All Activity
          </Button>
        </div>
        
        {recentActivities.length === 0 ? (
          <div className="text-center py-6">
            <ApperIcon name="Activity" size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const typeInfo = activityService.getActivityTypeInfo(activity.type);
              const teamMember = teamMembers.find(m => m.Id === activity.userId);
              
              return (
                <div key={activity.Id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${typeInfo.bgColor} flex items-center justify-center`}>
                    <ApperIcon name={typeInfo.icon} size={16} className={typeInfo.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{teamMember?.name || 'Unknown User'}</span>
                      {' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
};

const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  };

  const getTaskListStats = () => {
    const total = taskLists.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    return { total, totalTasks, completedTasks };
  };

  const getMilestoneStats = () => {
    const total = milestones.length;
    const completed = milestones.filter(milestone => milestone.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  };

const taskStats = getTaskStats();
  const milestoneStats = getMilestoneStats();
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
        <Loading type="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
        <Error message={error} onRetry={loadProjectData} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600">The requested project could not be found.</p>
        </div>
      </div>
    );
  }
  // Calendar helper functions
  const getCalendarDates = () => {
    const start = startOfWeek(startOfMonth(calendarDate));
    const end = endOfWeek(endOfMonth(calendarDate));
    const dates = [];
    let current = start;
    
    while (current <= end) {
      dates.push(current);
      current = addDays(current, 1);
    }
    
    return dates;
  };

const getDateTasks = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(parseISO(task.dueDate), date);
    });
  };
const getMilestoneTaskLists = (milestoneId) => {
    return taskLists.filter(tl => tl.milestoneId === milestoneId);
  };

  const getDateMilestones = (date) => {
    return milestones.filter(milestone => {
      if (!milestone.dueDate) return false;
      return isSameDay(parseISO(milestone.dueDate), date);
    });
  };

  const isProjectDeadline = (date) => {
    if (!project?.deadline) return false;
    return isSameDay(parseISO(project.deadline), date);
  };

  const getDateTimeEntries = (date) => {
    return timeEntries.filter(entry => {
      if (!entry.date) return false;
      return isSameDay(parseISO(entry.date), date);
    });
  };

  const getDateTimeTotal = (date) => {
    const entries = getDateTimeEntries(date);
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.Id === taskId);
    return task ? task.name : 'General Work';
  };

  const getDateEventCount = (date) => {
    const dateTasks = getDateTasks(date);
    const dateMilestones = getDateMilestones(date);
    const hasProjectDeadline = isProjectDeadline(date);
    
    return dateTasks.length + dateMilestones.length + (hasProjectDeadline ? 1 : 0);
  };

  const getDatePriorityLevel = (date) => {
    const dateTasks = getDateTasks(date);
    const hasProjectDeadline = isProjectDeadline(date);
    
    if (hasProjectDeadline) return 'project';
    if (dateTasks.some(task => task.priority === 'High')) return 'high';
    if (dateTasks.some(task => task.priority === 'Medium')) return 'medium';
    if (dateTasks.length > 0) return 'low';
    
    return null;
  };

  const getDateHighlightClass = (date) => {
    const priorityLevel = getDatePriorityLevel(date);
    const isOverdue = isPast(date) && !isToday(date);
    const eventCount = getDateEventCount(date);
    
    if (eventCount === 0) return '';
    
    let baseClass = '';
    
    if (priorityLevel === 'project') {
      baseClass = isOverdue ? 'bg-red-600 text-white' : 'bg-purple-500 text-white';
    } else if (priorityLevel === 'high') {
      baseClass = isOverdue ? 'bg-red-500 text-white' : 'bg-orange-500 text-white';
    } else if (priorityLevel === 'medium') {
      baseClass = isOverdue ? 'bg-red-400 text-white' : 'bg-blue-500 text-white';
    } else {
      baseClass = isOverdue ? 'bg-red-300 text-white' : 'bg-gray-500 text-white';
    }
    
    return baseClass;
  };

  const renderCalendarWidget = () => {
    const calendarDates = getCalendarDates();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Project Calendar
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
              >
                <ApperIcon name="ChevronLeft" size={16} />
              </Button>
              <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                {format(calendarDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
              >
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalendarDate(new Date())}
          >
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDates.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, calendarDate);
            const isCurrentDay = isToday(date);
            const eventCount = getDateEventCount(date);
            const highlightClass = getDateHighlightClass(date);
            const dateTasks = getDateTasks(date);
            const dateMilestones = getDateMilestones(date);
            const hasProjectDeadline = isProjectDeadline(date);
            
            return (
              <div
                key={date.toISOString()}
                className={`
                  relative min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-all duration-200
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                  ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                  ${selectedCalendarDate && isSameDay(date, selectedCalendarDate) ? 'ring-2 ring-purple-500' : ''}
                  hover:bg-gray-50
                `}
                onClick={() => setSelectedCalendarDate(selectedCalendarDate && isSameDay(date, selectedCalendarDate) ? null : date)}
              >
                {/* Date Number */}
                <div className={`
                  text-sm font-medium mb-1
                  ${highlightClass ? 'text-white' : (isCurrentMonth ? 'text-gray-900' : 'text-gray-400')}
                `}>
                  {format(date, 'd')}
                </div>

                {/* Event Indicators */}
                {eventCount > 0 && (
                  <div className="space-y-1">
                    {/* Project Deadline */}
                    {hasProjectDeadline && (
                      <div className="w-full h-1 bg-purple-500 rounded text-xs text-white px-1 truncate">
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Flag" size={8} />
                          <span className="text-[10px]">Project Due</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Tasks */}
                    {dateTasks.slice(0, 2).map((task, taskIndex) => (
                      <div
                        key={task.Id}
                        className={`
                          text-xs px-1 py-0.5 rounded truncate
                          ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}
                          ${task.completed ? 'line-through opacity-60' : ''}
                        `}
                        title={task.name}
                      >
                        {task.name}
                      </div>
                    ))}
                    
                    {/* Milestones */}
                    {dateMilestones.slice(0, 1).map((milestone, milestoneIndex) => (
                      <div
                        key={milestone.Id}
                        className="text-xs px-1 py-0.5 bg-purple-100 text-purple-800 rounded truncate flex items-center gap-1"
                        title={milestone.title}
                      >
                        <ApperIcon name="Diamond" size={8} />
                        {milestone.title}
                      </div>
                    ))}
                    
                    {/* More indicator */}
                    {eventCount > 3 && (
                      <div className="text-xs text-gray-600 px-1">
                        +{eventCount - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* Today indicator */}
                {isCurrentDay && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Project Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Low Priority</span>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedCalendarDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">
              {format(selectedCalendarDate, 'EEEE, MMMM d, yyyy')}
            </h4>
            
            {isProjectDeadline(selectedCalendarDate) && (
              <div className="mb-3 p-2 bg-purple-100 border border-purple-200 rounded flex items-center gap-2">
                <ApperIcon name="Flag" size={16} className="text-purple-600" />
                <span className="text-purple-800 font-medium">Project Deadline: {project.name}</span>
              </div>
            )}
            
            {getDateTasks(selectedCalendarDate).length > 0 && (
              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-2">Tasks Due:</h5>
                <div className="space-y-1">
                  {getDateTasks(selectedCalendarDate).map(task => (
                    <div key={task.Id} className="flex items-center justify-between text-sm">
                      <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-900'}>
                        {task.name}
                      </span>
                      <span className={`
                        px-2 py-1 text-xs rounded
                        ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {getDateMilestones(selectedCalendarDate).length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Milestones:</h5>
                <div className="space-y-1">
                  {getDateMilestones(selectedCalendarDate).map(milestone => (
                    <div key={milestone.Id} className="flex items-center gap-2 text-sm">
                      <ApperIcon name="Diamond" size={12} className="text-purple-600" />
                      <span className={milestone.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}>
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
)}

            {/* Time Entries for the selected date */}
            {getDateTimeEntries(selectedCalendarDate).length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <ApperIcon name="Clock" size={16} className="mr-2" />
                  Logged Time ({getDateTimeTotal(selectedCalendarDate).toFixed(1)}h)
                </h4>
                <div className="space-y-2">
                  {getDateTimeEntries(selectedCalendarDate).map(entry => (
                    <div key={entry.Id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-900">
                          {getTaskName(entry.taskId)}
                        </span>
                        <span className="text-sm font-semibold text-blue-700">
                          {entry.duration}h
                        </span>
                      </div>
                      <p className="text-xs text-blue-800 line-clamp-2">
                        {entry.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {getDateEventCount(selectedCalendarDate) === 0 && getDateTimeEntries(selectedCalendarDate).length === 0 && (
              <p className="text-gray-500 text-sm">No tasks, milestones, or time entries on this date.</p>
            )}
          </div>
        )}
      </Card>
    );
};
  
  return (
<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
          <div>
<h1 className="text-3xl font-bold gradient-text mb-2">{project.name}</h1>
            <p className="text-gray-600">Project Details & Tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={openEditModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Edit2" size={16} />
            Edit Project
          </Button>
          <Button
            variant="primary"
            onClick={openCreateMilestoneModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Flag" size={16} />
            New Milestone
          </Button>
          <Button 
            variant="secondary" 
            onClick={openCreateTaskListModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="List" size={16} />
            New Task List
          </Button>
        </div>
      </div>

      {/* Project Views */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Project Views
          </h2>
          <div className="flex items-center gap-3">
<div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="BarChart3" size={16} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'milestones'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Flag" size={16} />
                Milestones
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'tasks'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="CheckSquare" size={16} />
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('kanban')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Columns" size={16} />
                Kanban
              </button>
              <button
                onClick={() => setActiveTab('time')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'time'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Clock" size={16} />
                Time Spent
              </button>
            </div>
            {activeTab === 'timeline' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimelineView('calendar')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    timelineView === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ApperIcon name="Calendar" size={14} />
                  Calendar
                </button>
                <button
                  onClick={() => setTimelineView('gantt')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    timelineView === 'gantt'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ApperIcon name="BarChart" size={14} />
                  Timeline
                </button>
              </div>
            )}
          </div>
</div>

        {/* Tab Content */}
<div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Project Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ApperIcon name="CheckSquare" size={20} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{taskStats.completionRate}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium">{taskStats.completed}/{taskStats.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${taskStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ApperIcon name="Flag" size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{milestoneStats.completionRate}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium">{milestoneStats.completed}/{milestoneStats.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${milestoneStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ApperIcon name="Calendar" size={20} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Due Date</span>
                      <span className="font-medium">{formatDate(project.deadline)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Project Information */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openEditModal}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Edit2" size={16} />
                    Edit Project
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <div className="flex items-center">
                      <ApperIcon name="User" size={16} className="mr-2 text-gray-500" />
                      <span 
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => client && navigate(`/clients/${client.Id}`)}
                      >
                        {client?.name || "Unknown Client"}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <div className="flex items-center">
                      <ApperIcon name="Calendar" size={16} className="mr-2 text-gray-500" />
                      <span className="text-gray-900">
                        {project.startDate ? format(parseISO(project.startDate), 'MMM dd, yyyy') : 'Not set'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                    <div className="flex items-center">
                      <ApperIcon name="Calendar" size={16} className="mr-2 text-gray-500" />
                      <span className="text-gray-900">{formatDate(project.deadline)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <div className="flex items-center">
                      <ApperIcon name="DollarSign" size={16} className="mr-2 text-gray-500" />
                      <span className="text-gray-900">${project.budget?.toLocaleString() || 'Not set'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <div className="flex items-center">
                      <ApperIcon name="AlertCircle" size={16} className="mr-2 text-gray-500" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        project.priority === 'high' ? 'bg-red-100 text-red-800' :
                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.priority || 'medium'}
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}

                {project.deliverables && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{project.deliverables}</p>
                  </div>
                )}
              </Card>

              {/* Client Information */}
              {client && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/clients/${client.Id}`)}
                      className="flex items-center gap-2"
                    >
                      View Full Details
                      <ApperIcon name="ArrowRight" size={16} />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <p className="text-gray-900">{client.company}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="flex items-center">
                        <ApperIcon name="Mail" size={16} className="mr-2 text-gray-500" />
                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                          {client.email}
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="flex items-center">
                        <ApperIcon name="Phone" size={16} className="mr-2 text-gray-500" />
                        <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800">
                          {client.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Kanban Board Tab */}
          {activeTab === 'kanban' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Kanban Board</h2>
                  <p className="text-sm text-gray-600 mt-1">Drag tasks between columns to update their status</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => openCreateTaskModal()}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  Add Task
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
                {getKanbanColumns().map((column) => (
                  <div
                    key={column.id}
                    className={`kanban-column border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                      column.color
                    } ${
                      dragOverColumn === column.id 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className={`kanban-header p-3 rounded-lg mb-4 ${column.headerColor}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{column.title}</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                          {column.tasks.length}
                        </span>
                      </div>
                    </div>

                    <div className="kanban-tasks space-y-3 min-h-[400px]">
                      {column.tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                          <ApperIcon name="Archive" size={32} className="mb-2 opacity-50" />
                          <p className="text-sm">No tasks</p>
                          <p className="text-xs">Drag tasks here</p>
                        </div>
                      ) : (
                        column.tasks.map((task) => (
                          <div
                            key={task.Id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            className={`kanban-task-card cursor-move transition-all duration-200 ${
                              draggedTask?.Id === task.Id ? 'opacity-50 transform scale-95' : ''
                            }`}
                          >
                            <TaskCard
                              task={task}
                              project={project}
                              onEdit={openEditTaskModal}
                              onDelete={handleDeleteTask}
                              onToggleComplete={handleToggleTaskComplete}
                              kanban={true}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
          <Card className="p-6">
            {timelineView === 'calendar' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Project Timeline Calendar</h3>
                  <div className="text-sm text-gray-600">
                    {tasks.length} tasks • {milestones.length} milestones
                  </div>
                </div>
                
                {/* Simplified Calendar View for Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mini Calendar */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Quick Timeline View</div>
                      <div className="space-y-2">
                        {tasks.slice(0, 5).map(task => (
                          <div key={task.Id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm font-medium">{task.name}</span>
                            <span className="text-xs text-gray-500">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Stats */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-900">Upcoming Tasks</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > new Date()).length}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-green-900">Completed</div>
                      <div className="text-2xl font-bold text-green-600">
                        {tasks.filter(t => t.completed).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Timeline View
                  </h3>
                  <div className="text-sm text-gray-600">
                    {tasks.length} tasks • {milestones.length} milestones
                  </div>
                </div>
                
                {tasks.length === 0 ? (
                  <Empty
                    icon="BarChart"
                    title="No tasks to display"
                    description="Create tasks to see them in the timeline view"
                    actionLabel="Add First Task"
                    onAction={() => openCreateTaskModal()}
                  />
                ) : (
                  <div className="timeline-container overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Timeline Header */}
                      <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                        <div className="w-64 text-sm font-medium text-gray-700">Task</div>
                        <div className="flex-1 text-sm font-medium text-gray-700 text-center">Timeline</div>
                        <div className="w-20 text-sm font-medium text-gray-700 text-center">Duration</div>
                      </div>
                      
                      {/* Timeline Tasks */}
                      <div className="space-y-2">
                        {tasks.map((task) => {
                          const startDate = new Date(task.startDate || task.createdAt);
                          const endDate = new Date(task.dueDate);
                          const duration = Math.max(1, differenceInDays(endDate, startDate) + 1);
                          
                          return (
                            <div key={task.Id} className="flex items-center group">
                              <div className="w-64 pr-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    task.completed 
                                      ? 'bg-green-500' 
                                      : task.priority === 'High' 
                                        ? 'bg-red-500' 
                                        : task.priority === 'Medium' 
                                          ? 'bg-yellow-500' 
                                          : 'bg-blue-500'
                                  }`} />
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {task.name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {task.priority} Priority
                                </div>
                              </div>
                              
                              <div className="flex-1 relative h-8 bg-gray-50 rounded">
                                <div 
                                  className={`absolute top-1 bottom-1 rounded transition-all duration-200 group-hover:shadow-md ${
                                    task.completed 
                                      ? 'bg-green-500' 
                                      : task.priority === 'High' 
                                        ? 'bg-red-500' 
                                        : task.priority === 'Medium' 
                                          ? 'bg-yellow-500' 
                                          : 'bg-blue-500'
                                  }`}
                                  style={{
                                    left: '2%',
                                    width: `${Math.min(96, (duration / 30) * 100)}%`
                                  }}
                                >
                                  <div className="px-2 py-1 text-xs text-white font-medium truncate">
                                    {task.name}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="w-20 text-center text-sm text-gray-600">
                                {duration}d
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Milestones */}
                      {milestones.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Milestones</h4>
                          <div className="space-y-2">
                            {milestones.map((milestone) => (
                              <div key={milestone.Id} className="flex items-center">
                                <div className="w-64 pr-4">
                                  <div className="flex items-center gap-2">
                                    <ApperIcon name="Flag" size={14} className="text-purple-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {milestone.title}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 relative h-6 flex items-center">
                                  <div className="w-3 h-3 bg-purple-600 rotate-45 border-2 border-white shadow-md" />
                                  <div className="ml-2 text-xs text-gray-600">
                                    {new Date(milestone.dueDate).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="w-20 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    milestone.isCompleted 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {milestone.isCompleted ? 'Done' : 'Pending'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
)}

        {/* Wiki Tab */}
        {activeTab === 'wiki' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wiki Documents List */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Wiki Documents</h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={openCreateWikiModal}
                  >
                    <ApperIcon name="Plus" size={14} />
                    New Doc
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {wikiDocuments.length === 0 ? (
                    <Empty
                      icon="BookOpen"
                      title="No documents yet"
                      description="Create your first wiki document to get started"
                      actionLabel="Create Document"
                      onAction={openCreateWikiModal}
                    />
                  ) : (
                    wikiDocuments.map((doc) => (
                      <div
                        key={doc.Id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDocument?.Id === doc.Id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{doc.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.type} • {format(parseISO(doc.updatedAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditWikiModal(doc);
                              }}
                            >
                              <ApperIcon name="Edit" size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWikiDocument(doc.Id);
                              }}
                            >
                              <ApperIcon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Wiki Document Content */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {selectedDocument ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Last updated {format(parseISO(selectedDocument.updatedAt), 'MMM d, yyyy h:mm a')} by{' '}
                          {teamMembers.find(m => m.Id === selectedDocument.authorId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditWikiModal(selectedDocument)}
                        >
                          <ApperIcon name="Edit" size={14} />
                          Edit
                        </Button>
                        {selectedDocument.versions && selectedDocument.versions.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <ApperIcon name="History" size={14} />
                            History ({selectedDocument.versions.length})
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedDocument.content }} />
                    </div>
                  </div>
                ) : (
                  <Empty
                    icon="BookOpen"
                    title="Select a document"
                    description="Choose a document from the list to view its content"
                  />
                )}
              </Card>
            </div>
          </div>
        )}

{/* Chat Tab */}
        {activeTab === 'chat' && (
          <ChatChannel 
            projectId={project.Id}
            channelType="project"
            channelName={`${project.name} Chat`}
          />
        )}

{/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Header */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Calendar</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage events, deadlines, and milestones for {project?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarDate(new Date())}
                  >
                    <ApperIcon name="Calendar" size={16} />
                    Today
                  </Button>
                  <Button
                    variant="primary"
                    onClick={openCreateEventModal}
                  >
                    <ApperIcon name="Plus" size={16} />
                    New Event
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Calendar */}
{renderCalendarWidget()}
{/* Calendar Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Events */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Upcoming Events</h4>
                    <span className="text-sm text-gray-500">
                      {calendarEvents.filter(event => isFuture(parseISO(event.startDate))).length} events
                    </span>
                  </div>
<div className="space-y-3 max-h-80 overflow-y-auto">
                    {calendarEvents
                      .filter(event => isFuture(parseISO(event.startDate)))
                      .sort((a, b) => parseISO(a.startDate) - parseISO(b.startDate))
                      .slice(0, 8)
                      .map((event) => (
                        <div key={event.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              event.type === 'meeting' ? 'bg-blue-500' :
                              event.type === 'deadline' ? 'bg-red-500' :
                              event.type === 'milestone' ? 'bg-purple-500' :
                              'bg-green-500'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900 text-sm truncate">{event.title}</h5>
                              <p className="text-xs text-gray-500">
                                {format(parseISO(event.startDate), 'MMM d, h:mm a')}
                                {event.location && ` • ${event.location}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditEventModal(event)}
                              className="p-1.5"
                            >
                              <ApperIcon name="Edit" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCalendarEvent(event.Id)}
                              className="p-1.5 text-red-600 hover:text-red-700"
                            >
                              <ApperIcon name="Trash2" size={12} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    
                    {calendarEvents.filter(event => isFuture(parseISO(event.startDate))).length === 0 && (
                      <div className="text-center py-8">
                        <ApperIcon name="CalendarDays" size={32} className="text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-3">No upcoming events</p>
                        <Button variant="outline" size="sm" onClick={openCreateEventModal}>
                          <ApperIcon name="Plus" size={14} />
                          Create First Event
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Calendar Stats Sidebar */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h5 className="font-medium text-gray-900 mb-3">This Month</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Events</span>
                      <span className="font-medium">{calendarEvents.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Meetings</span>
                      <span className="font-medium">{calendarEvents.filter(e => e.type === 'meeting').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deadlines</span>
                      <span className="font-medium">{calendarEvents.filter(e => e.type === 'deadline').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Milestones</span>
                      <span className="font-medium">{milestones.length}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Quick Actions</h5>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={openCreateEventModal}
                      className="w-full justify-start"
                    >
                      <ApperIcon name="Plus" size={14} />
                      New Event
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={openCreateMilestoneModal}
                      className="w-full justify-start"
                    >
                      <ApperIcon name="Flag" size={14} />
                      Add Milestone
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCalendarDate(new Date())}
                      className="w-full justify-start"
                    >
                      <ApperIcon name="Calendar" size={14} />
                      Go to Today
                    </Button>
                  </div>
                </Card>
              </div>
</div>
          </div>
        )}
        {/* Activity Tab */}
        {activeTab === 'activity' && renderActivitySection()}
{/* Time Spent Tab */}
        {activeTab === 'time' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Project Time Tracking</h3>
              <div className="text-sm text-gray-600">
                Total: {timeEntries.reduce((total, entry) => total + entry.duration, 0).toFixed(1)} hours
              </div>
            </div>
            
            {timeEntries.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="Clock" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No time entries yet</h3>
                <p className="text-gray-600">Time entries will appear here when work is logged on project tasks</p>
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
                    <span className="text-sm font-medium text-gray-700">Total Project Time:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {timeEntries.reduce((total, entry) => total + entry.duration, 0).toFixed(1)} hours
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'gantt' && (
          <Card className="p-6">
            <div className="space-y-4">
              {/* Gantt Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gantt Chart
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimelineStart(addDays(timelineStart, -30))}
                    >
                      <ApperIcon name="ChevronLeft" size={16} />
                    </Button>
                    <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
                      {format(timelineStart, 'MMM d, yyyy')} - {format(addDays(timelineStart, 89), 'MMM d, yyyy')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimelineStart(addDays(timelineStart, 30))}
                    >
                      <ApperIcon name="ChevronRight" size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimelineStart(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded" />
                    <span>Medium Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>Low Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
              
              {tasks.length === 0 ? (
                <Empty
                  icon="BarChart"
                  title="No tasks to display"
                  description="Create tasks to see them in the Gantt chart"
                  actionLabel="Add First Task"
                  onAction={() => openCreateTaskModal()}
                />
              ) : (
                <div className="timeline-container overflow-x-auto">
                  <div style={{ minWidth: '1400px' }}>
                    {/* Calculate timeline bounds */}
                    {(() => {
                      const timelineEnd = addDays(timelineStart, 89); // 90 days total
                      const totalDays = 90;
                      const today = new Date();
                      
                      // Generate date headers
                      const generateDates = () => {
                        const dates = [];
                        for (let i = 0; i < totalDays; i += 7) { // Weekly columns
                          dates.push(addDays(timelineStart, i));
                        }
                        return dates;
                      };
                      
                      const weekDates = generateDates();
                      
                      // Task positioning helper
                      const getTaskPosition = (task) => {
                        const taskStart = task.startDate ? parseISO(task.startDate) : parseISO(task.createdAt);
                        const taskEnd = task.dueDate ? parseISO(task.dueDate) : addDays(taskStart, 1);
                        
                        const startOffset = Math.max(0, differenceInDays(taskStart, timelineStart));
                        const endOffset = Math.min(totalDays, differenceInDays(taskEnd, timelineStart) + 1);
                        const duration = Math.max(1, endOffset - startOffset);
                        
                        return {
                          left: (startOffset / totalDays) * 100,
                          width: (duration / totalDays) * 100,
                          visible: startOffset < totalDays && endOffset > 0
                        };
                      };
                      
                      return (
                        <>
                          {/* Gantt Header */}
                          <div className="flex mb-4 pb-2 border-b border-gray-200">
                            <div className="w-80 text-sm font-medium text-gray-700 flex items-center px-4">
                              Task Details
                            </div>
                            <div className="flex-1 relative">
                              <div className="flex">
                                {weekDates.map((date, index) => (
                                  <div
                                    key={date.toISOString()}
                                    className="flex-1 px-2 py-2 text-center border-r border-gray-100 last:border-r-0"
                                    style={{ minWidth: `${100 / weekDates.length}%` }}
                                  >
                                    <div className="text-xs font-medium text-gray-700">
                                      {format(date, 'MMM dd')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {format(date, 'yyyy')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Today indicator */}
                              {differenceInDays(today, timelineStart) >= 0 && differenceInDays(today, timelineStart) < totalDays && (
                                <div 
                                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                                  style={{
                                    left: `${(differenceInDays(today, timelineStart) / totalDays) * 100}%`
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          
                          {/* Gantt Tasks */}
                          <div className="space-y-1">
                            {tasks.map((task) => {
                              const taskStart = task.startDate ? parseISO(task.startDate) : parseISO(task.createdAt);
                              const taskEnd = task.dueDate ? parseISO(task.dueDate) : addDays(taskStart, 1);
                              const position = getTaskPosition(task);
                              const isOverdue = !task.completed && isPast(taskEnd);
                              
                              if (!position.visible) return null;
                              
                              return (
                                <div key={task.Id} className="flex items-center group hover:bg-gray-50 rounded-lg p-2 transition-colors">
                                  <div className="w-80 pr-4">
                                    <div className="flex items-center gap-3">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleTimelineTaskUpdate(task.Id, { completed: !task.completed })}
                                        className="p-1 hover:bg-gray-100"
                                      >
                                        <ApperIcon 
                                          name={task.completed ? "CheckSquare" : "Square"} 
                                          size={16} 
                                          className={task.completed ? "text-green-600" : "text-gray-400"}
                                        />
</Button>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate">{task.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                            task.priority === 'High' 
                                              ? 'bg-red-100 text-red-700'
                                              : task.priority === 'Medium' 
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                          }`}>
                                            {task.priority}
                                          </span>
                                          <span>
                                            {task.startDate ? format(parseISO(task.startDate), 'MMM dd') : format(taskStart, 'MMM dd')} - {format(taskEnd, 'MMM dd')}
                                          </span>
                                          {isOverdue && (
                                            <span className="text-red-600 font-medium">Overdue</span>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditTaskModal(task)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                      >
                                        <ApperIcon name="Edit" size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 relative" style={{ height: '48px' }}>
                                    {/* Background grid */}
                                    <div className="absolute inset-0 flex">
                                      {weekDates.map((date, index) => (
                                        <div 
                                          key={index} 
                                          className="flex-1 border-r border-gray-100 last:border-r-0"
                                          style={{ minWidth: `${100 / weekDates.length}%` }}
                                        />
                                      ))}
                                    </div>
                                    
                                    {/* Task bar */}
                                    <div 
                                      className={`absolute top-2 bottom-2 rounded-md shadow-sm transition-all duration-200 group-hover:shadow-md timeline-task-bar cursor-pointer ${
                                        task.completed 
                                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                          : isOverdue
                                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                                            : task.priority === 'High' 
                                              ? 'bg-gradient-to-r from-red-400 to-red-500' 
                                              : task.priority === 'Medium' 
                                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                                                : 'bg-gradient-to-r from-blue-400 to-blue-500'
                                      }`}
                                      style={{
                                        left: `${position.left}%`,
                                        width: `${Math.max(2, position.width)}%`
                                      }}
                                      onClick={() => openEditTaskModal(task)}
                                      title={`${task.name} - ${task.priority} Priority`}
                                    >
                                      <div className="px-3 py-2 text-xs text-white font-medium truncate h-full flex items-center">
                                        <span className="truncate">{task.name}</span>
                                        {task.completed && (
                                          <ApperIcon name="Check" size={12} className="text-white ml-2 flex-shrink-0" />
                                        )}
                                      </div>
                                      
                                      {/* Progress indicator */}
                                      {!task.completed && task.progress > 0 && (
                                        <div 
                                          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-40 rounded-b-md"
                                          style={{ width: `${task.progress}%` }}
                                        />
                                      )}
                                    </div>
                                    
                                    {/* Today indicator overlay */}
                                    {differenceInDays(today, timelineStart) >= 0 && differenceInDays(today, timelineStart) < totalDays && (
                                      <div 
                                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                                        style={{
                                          left: `${(differenceInDays(today, timelineStart) / totalDays) * 100}%`
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Milestones */}
                          {milestones.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Project Milestones</h4>
                              <div className="space-y-1">
                                {milestones.map((milestone) => {
                                  const milestoneDate = parseISO(milestone.dueDate);
                                  const offset = differenceInDays(milestoneDate, timelineStart);
                                  const isVisible = offset >= 0 && offset < totalDays;
                                  
                                  if (!isVisible) return null;
                                  
                                  return (
                                    <div key={milestone.Id} className="flex items-center group hover:bg-gray-50 rounded-lg p-2 transition-colors">
                                      <div className="w-80 pr-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                                            <ApperIcon name="Flag" size={10} className="text-white" />
                                          </div>
<div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate">{milestone.title}</div>
                                            <div className="text-xs text-gray-500">
                                              {milestone.startDate && (
                                                <span>Start: {format(parseISO(milestone.startDate), 'MMM dd, yyyy')} • </span>
                                              )}
                                              Due: {format(milestoneDate, 'MMM dd, yyyy')}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex-1 relative" style={{ height: '48px' }}>
                                        {/* Background grid */}
                                        <div className="absolute inset-0 flex">
                                          {weekDates.map((date, index) => (
                                            <div 
                                              key={index} 
                                              className="flex-1 border-r border-gray-100 last:border-r-0"
                                              style={{ minWidth: `${100 / weekDates.length}%` }}
                                            />
                                          ))}
                                        </div>
                                        
                                        {/* Milestone marker */}
                                        <div 
                                          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-15"
                                          style={{ left: `${(offset / totalDays) * 100}%` }}
                                        >
                                          <div className="relative">
                                            <div className="w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-md timeline-milestone">
                                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-purple-600" />
                                            </div>
                                            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-700 font-medium whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
                                              {milestone.title}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </Card>
)}
      </div>
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Project Milestones</h2>
                  <p className="text-gray-600">Organize your project into manageable phases</p>
                </div>
                <Button onClick={openCreateMilestoneModal} variant="primary">
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Milestone
                </Button>
              </div>

              {milestones.length === 0 ? (
                <Empty
                  icon="Flag"
                  title="No milestones yet"
                  description="Create milestones to organize your project into manageable phases. Each milestone can contain multiple task lists."
                  actionLabel="Add First Milestone"
                  onAction={openCreateMilestoneModal}
                />
              ) : (
                <div className="space-y-6">
                  {milestones.map((milestone) => {
                    const milestoneTaskLists = getMilestoneTaskLists(milestone.Id);
                    const milestoneTasks = tasks.filter(task => 
                      milestoneTaskLists.some(tl => tl.tasks.includes(task.Id))
                    );
                    const completedTasks = milestoneTasks.filter(task => task.completed).length;
                    const totalTasks = milestoneTasks.length;
                    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                      <Card key={milestone.Id} className="p-6">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-3">
<div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  <button
                                    onClick={() => navigate(`/projects/${project.Id}/milestones/${milestone.Id}`)}
                                    className="text-left hover:underline focus:outline-none focus:underline"
                                  >
                                    {milestone.title}
                                  </button>
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                  milestone.isCompleted 
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }`}>
                                  {milestone.isCompleted ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                              
                              {milestone.description && (
                                <p className="text-gray-600 text-sm mb-3">
                                  {milestone.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <ApperIcon name="Calendar" size={14} />
                                  <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ApperIcon name="List" size={14} />
                                  <span>{milestoneTaskLists.length} task lists</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ApperIcon name="CheckSquare" size={14} />
                                  <span>{totalTasks} tasks ({completedTasks} completed)</span>
                                </div>
                              </div>

                              {totalTasks > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Progress</span>
                                    <span className="text-xs font-medium text-gray-900">{completionRate}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${completionRate}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleMilestoneComplete(milestone.Id, !milestone.isCompleted)}
                                className={`p-2 ${milestone.isCompleted ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                              >
                                <ApperIcon name={milestone.isCompleted ? "RotateCcw" : "Check"} size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditMilestoneModal(milestone)}
                                className="p-2"
                              >
                                <ApperIcon name="Edit2" size={16} className="text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMilestone(milestone.Id)}
                                className="p-2 text-red-600 hover:text-red-700"
                              >
                                <ApperIcon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Task Lists for this Milestone */}
                        <div className="space-y-3">
                          {milestoneTaskLists.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                              <ApperIcon name="List" size={24} className="text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-3">No task lists in this milestone yet</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={openCreateTaskListModal}
                                className="flex items-center gap-2"
                              >
                                <ApperIcon name="Plus" size={14} />
                                Add Task List
                              </Button>
                            </div>
                          ) : (
                            milestoneTaskLists.map((taskList) => (
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
                            ))
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <Tasks project={project} />
            </div>
          )}
        </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModals}
        title="Edit Project"
        className="max-w-lg"
      >
        <ProjectForm
          project={project}
          clients={clients}
          onSubmit={handleEditProject}
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
          projects={[project]} // Only show current project
          milestones={milestones}
          taskLists={taskLists}
          selectedTaskList={selectedTaskList}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
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
          milestones={milestones}
          onSubmit={editingTaskList ? handleEditTaskList : handleCreateTaskList}
          onCancel={closeModals}
        />
      </Modal>

{/* Create/Edit Milestone Modal */}
      <Modal
        isOpen={showMilestoneModal}
        onClose={closeModals}
        title={editingMilestone ? "Edit Milestone" : "Create New Milestone"}
        className="max-w-lg"
      >
        <MilestoneForm
          milestone={editingMilestone}
          onSubmit={editingMilestone ? handleEditMilestone : handleCreateMilestone}
          onCancel={closeModals}
        />
</Modal>

      {/* Wiki Document Modal */}
      <Modal
        isOpen={showWikiModal}
        onClose={closeModals}
        title={editingWikiDoc ? "Edit Wiki Document" : "Create New Wiki Document"}
        className="max-w-4xl"
      >
        <WikiDocumentForm
          document={editingWikiDoc}
          content={wikiContent}
          onContentChange={setWikiContent}
          onSubmit={editingWikiDoc ? handleEditWikiDocument : handleCreateWikiDocument}
          onCancel={closeModals}
        />
      </Modal>

      {/* Calendar Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={closeModals}
        title={editingEvent ? "Edit Calendar Event" : "Create New Calendar Event"}
        className="max-w-lg"
      >
        <CalendarEventForm
          event={editingEvent}
          teamMembers={teamMembers}
          onSubmit={editingEvent ? handleEditCalendarEvent : handleCreateCalendarEvent}
          onCancel={closeModals}
        />
      </Modal>
</div>
  );
};

export default ProjectDetail;