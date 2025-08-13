import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const TaskForm = ({ task, projects, milestones, taskLists, selectedTaskList, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectId: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    completed: false
  });
  const [errors, setErrors] = useState({});

useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        projectId: task.projectId || "",
        priority: task.priority || "Medium",
        startDate: task.startDate || "",
        dueDate: task.dueDate || "",
        completed: task.completed || false
      });
    } else {
      setFormData({
        name: "",
        description: "",
        projectId: projects.length > 0 ? projects[0].Id : "",
        priority: "Medium",
        startDate: "",
        dueDate: "",
        completed: false
      });
    }
  }, [task, projects]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        projectId: parseInt(formData.projectId)
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Task Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter task name"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          placeholder="Enter task description (optional)"
        />
      </div>

<div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project *
        </label>
        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
            errors.projectId ? "border-red-500" : "border-gray-300"
          }`}
          required
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.Id} value={project.Id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
        )}
      </div>

      {selectedTaskList && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <ApperIcon name="List" size={16} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Adding to: {selectedTaskList.name}
              </p>
              <p className="text-xs text-blue-700">
                Milestone: {milestones?.find(m => m.Id === selectedTaskList.milestoneId)?.title}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
          style={{'--tw-ring-color': '#4A90E2'}}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

<Input
        label="Start Date"
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        placeholder="Select start date"
      />
      <Input
        label="Due Date"
        name="dueDate"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        placeholder="Select due date"
      />

      {task && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="completed"
            name="completed"
            checked={formData.completed}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="completed" className="ml-2 text-sm text-gray-700">
            Mark as completed
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          <ApperIcon name="Save" size={16} className="mr-2" />
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;