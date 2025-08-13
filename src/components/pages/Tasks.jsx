import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import taskService from "@/services/api/taskService";
import projectService from "@/services/api/projectService";
import { create, getAll, update } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TaskForm from "@/components/molecules/TaskForm";
import TaskCard from "@/components/molecules/TaskCard";
import CollaborationSection from "@/components/molecules/CollaborationSection";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Pagination from "@/components/atoms/Pagination";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
const Tasks = ({ project }) => {
const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
const [filter, setFilter] = useState("all"); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      if (project) {
        // If project is provided, filter tasks for that project
        const [tasksData, projectsData] = await Promise.all([
          taskService.getAll(),
          projectService.getAll()
        ]);
        const projectTasks = tasksData.filter(task => task.projectId === project.Id);
        setTasks(projectTasks);
        setProjects(projectsData);
      } else {
        // Load all tasks if no project specified
        const [tasksData, projectsData] = await Promise.all([
          taskService.getAll(),
          projectService.getAll()
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [project]);

  const getProjectById = (projectId) => {
    return projects.find(project => project.Id === parseInt(projectId));
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      setShowModal(false);
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
      setShowModal(false);
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
        setTasks(prev => prev.filter(task => task.Id !== taskId));
        toast.success("Task deleted successfully!");
      } catch (err) {
        console.error("Failed to delete task:", err);
        toast.error("Failed to delete task. Please try again.");
      }
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const updatedTask = await taskService.update(taskId, { completed });
      setTasks(prev => 
        prev.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      );
      toast.success(completed ? "Task marked as completed!" : "Task marked as pending!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const openCreateModal = () => {
    if (projects.length === 0) {
      toast.error("Please add at least one project before creating a task.");
      return;
    }
    setEditingTask(null);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === "all" || 
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);
    
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectById(task.projectId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage your project tasks</p>
          </div>
        </div>
        <Loading type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage your project tasks</p>
          </div>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {project ? `${project.name} Tasks` : 'Tasks'}
          </h1>
          <p className="text-gray-600">
            {project ? `Manage tasks for ${project.name}` : 'Manage your project tasks'}
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Task
        </Button>
      </div>
<div className="space-y-4">
        <Input
          placeholder="Search tasks by title, description, or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
          className="max-w-md"
        />
      </div>
      {tasks.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: "all", label: "All", count: taskCounts.all },
              { key: "pending", label: "Pending", count: taskCounts.pending },
              { key: "completed", label: "Completed", count: taskCounts.completed }
            ].map((filterOption) => (
<button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.key 
                    ? "text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
                style={filter === filterOption.key ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" 
                  ? "text-white shadow-sm"
                  : "hover:text-gray-900"
              }`}
              style={viewMode === "grid" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
            >
              <ApperIcon name="Grid3X3" size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" 
                  ? "text-white shadow-sm"
                  : "hover:text-gray-900"
              }`}
              style={viewMode === "list" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
            >
              <ApperIcon name="List" size={16} />
            </button>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title={
            tasks.length === 0 
              ? "No tasks yet" 
              : filter === "completed" 
                ? "No completed tasks"
                : "No pending tasks"
          }
          description={
            tasks.length === 0
              ? projects.length === 0 
                ? "Add some projects first, then create tasks for them."
                : "Start organizing your work by creating your first task."
              : filter === "completed"
                ? "Complete some tasks to see them here."
                : "All tasks are completed! Great job!"
          }
          actionLabel={tasks.length === 0 && projects.length > 0 ? "Add Task" : null}
          onAction={tasks.length === 0 && projects.length > 0 ? openCreateModal : null}
/>
) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                project={getProjectById(task.projectId)}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTasks.map((task) => {
                    const project = getProjectById(task.projectId);
                    return (
                      <tr key={task.Id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleComplete(task.Id, !task.completed)}
                              className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <div>
                              <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: project?.color || '#4A90E2'}}></div>
                            <span className="text-sm text-gray-900">{project?.name || 'No Project'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.startDate ? format(parseISO(task.startDate), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            task.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.completed ? 'Completed' : 'Pending'}
                          </span>
                        </td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit task"
                            >
                              <ApperIcon name="Edit2" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.Id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete task"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        startItem={startIndex + 1}
        endItem={endIndex}
      />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingTask ? "Edit Task" : "Add New Task"}
        className="max-w-lg"
>
        <TaskForm
          task={editingTask}
          projects={projects}
          defaultProject={project}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};
export default Tasks;