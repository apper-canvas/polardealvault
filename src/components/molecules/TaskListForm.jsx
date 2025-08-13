import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const TaskListForm = ({ taskList, milestones, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    milestoneId: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskList) {
      setFormData({
        name: taskList.name || "",
        description: taskList.description || "",
        milestoneId: taskList.milestoneId || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        milestoneId: milestones.length > 0 ? milestones[0].Id : ""
      });
    }
  }, [taskList, milestones]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Task list name is required";
    }

    if (!formData.milestoneId) {
      newErrors.milestoneId = "Please select a milestone";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        milestoneId: parseInt(formData.milestoneId)
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        label="Task List Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter task list name"
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
          placeholder="Enter task list description (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Milestone *
        </label>
        <select
          name="milestoneId"
          value={formData.milestoneId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.milestoneId ? "border-red-500" : "border-gray-300"
          }`}
          required
        >
          <option value="">Select a milestone</option>
          {milestones.map((milestone) => (
            <option key={milestone.Id} value={milestone.Id}>
              {milestone.title}
            </option>
          ))}
        </select>
        {errors.milestoneId && (
          <p className="mt-1 text-sm text-red-600">{errors.milestoneId}</p>
        )}
      </div>

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
          {taskList ? "Update Task List" : "Create Task List"}
        </Button>
      </div>
    </form>
  );
};

export default TaskListForm;