import React, { useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Layout from "@/components/organisms/Layout";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const TimeEntryForm = ({ timeEntry, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    projectId: "",
    description: "",
    date: "",
    duration: "",
    taskId: ""
  });
  const [errors, setErrors] = useState({});

useEffect(() => {
    if (timeEntry) {
      setFormData({
        projectId: timeEntry.projectId || "",
        description: timeEntry.description || "",
        date: timeEntry.date || "",
        duration: timeEntry.duration?.toString() || "",
        taskId: timeEntry.taskId || ""
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        projectId: projects.length > 0 ? projects[0].Id : "",
        description: "",
        date: today,
        duration: "",
        taskId: ""
      });
    }
  }, [timeEntry, projects]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    } else {
      const duration = parseFloat(formData.duration);
      if (isNaN(duration) || duration <= 0 || duration > 24) {
        newErrors.duration = "Duration must be between 0.1 and 24 hours";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        projectId: parseInt(formData.projectId),
        duration: parseFloat(formData.duration)
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

  const addQuickDuration = (hours) => {
    setFormData(prev => ({
      ...prev,
      duration: hours.toString()
    }));
    if (errors.duration) {
      setErrors(prev => ({
        ...prev,
        duration: ""
      }));
    }
  };

  const formatDurationInput = (value) => {
    // Convert common time formats to decimal hours
    if (value.includes(':')) {
      const [hours, minutes] = value.split(':');
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      return (h + m / 60).toString();
    }
    return value;
  };

  const handleDurationChange = (e) => {
    let value = e.target.value;
    
    // Handle time format conversion
    if (value.includes(':')) {
      value = formatDurationInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      duration: value
    }));
    
    if (errors.duration) {
      setErrors(prev => ({
        ...prev,
        duration: ""
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project *
        </label>
        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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

      {/* Task Selection (if project selected) */}
      {formData.projectId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task (optional)
          </label>
          <select
            name="taskId"
            value={formData.taskId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">No specific task</option>
            {/* Tasks would be filtered by project in real implementation */}
            <option value="1">Homepage Layout</option>
            <option value="2">User Authentication</option>
            <option value="3">Database Integration</option>
</select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe the work you did..."
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <Input
        label="Date *"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        required
      />

<div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (hours) *
        </label>
        <div className="space-y-3">
          <input
            name="duration"
            type="text"
            step="0.1"
            min="0.1"
            max="24"
            value={formData.duration}
            onChange={handleDurationChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.duration ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g. 8.5 or 8:30"
            required
          />
          {errors.duration && (
            <p className="text-sm text-red-600">{errors.duration}</p>
          )}
          
          {/* Quick Duration Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center mr-2">Quick add:</span>
            {[0.5, 1, 2, 4, 8].map(hours => (
              <Button
                key={hours}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addQuickDuration(hours)}
                className="text-xs px-2 py-1"
              >
                {hours}h
              </Button>
            ))}
          </div>
          
          {/* Duration Helper */}
          {formData.duration && !errors.duration && (
            <div className="text-sm text-gray-600">
              {parseFloat(formData.duration) > 0 && (
                <>
                  = {Math.floor(parseFloat(formData.duration))}h {Math.round((parseFloat(formData.duration) % 1) * 60)}m
                </>
              )}
            </div>
          )}
        </div>
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
          {timeEntry ? "Update Entry" : "Log Time"}
        </Button>
      </div>
    </form>
  );
};

export default TimeEntryForm;