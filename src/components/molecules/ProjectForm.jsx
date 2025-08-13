import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const ProjectForm = ({ project, clients, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    description: "",
    status: "Planning",
    startDate: "",
    deadline: "",
    deliverables: ""
  });

  const [errors, setErrors] = useState({});

useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        clientId: project.clientId || "",
        description: project.description || "",
        status: project.status || "Planning",
        startDate: project.startDate || "",
        deadline: project.deadline || "",
        deliverables: project.deliverables || ""
      });
    }
  }, [project]);

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!formData.clientId) {
      newErrors.clientId = "Please select a client";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    }
    
    if (!formData.deliverables.trim()) {
      newErrors.deliverables = "Deliverables are required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
<form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter project name"
        required
      />
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client *
        </label>
        <select
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.Id} value={client.Id}>
              {client.name} - {client.company}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="text-xs text-red-600 mt-1">{errors.clientId}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
        >
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
        {errors.status && (
          <p className="text-xs text-red-600 mt-1">{errors.status}</p>
        )}
      </div>
      
      <Input
label="Start Date"
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        error={errors.startDate}
        required
      />
      <Input
        label="Deadline"
        name="deadline"
        type="date"
        value={formData.deadline}
        onChange={handleChange}
        error={errors.deadline}
        required
      />
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 resize-none"
          placeholder="Describe the project details..."
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deliverables *
        </label>
        <textarea
          name="deliverables"
          value={formData.deliverables}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 resize-none"
          placeholder="List project deliverables and outcomes..."
        />
        {errors.deliverables && (
          <p className="text-xs text-red-600 mt-1">{errors.deliverables}</p>
        )}
      </div>
      
      <div className="flex space-x-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {project ? "Update Project" : "Create Project"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;