import React, { useState, useEffect } from 'react';
import Modal from '@/components/atoms/Modal';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

function TeamMemberForm({ isOpen, onClose, onSubmit, member, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'Active',
    phone: '',
    location: '',
    avatar: '',
    maxCapacity: 40,
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  const departments = ['Engineering', 'Design', 'Operations', 'Marketing', 'Sales', 'HR'];
  const statuses = ['Active', 'Away', 'Inactive'];

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        role: member.role || '',
        department: member.department || '',
        status: member.status || 'Active',
        phone: member.phone || '',
        location: member.location || '',
        avatar: member.avatar || '',
        maxCapacity: member.maxCapacity || 40,
        skills: member.skills || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        status: 'Active',
        phone: '',
        location: '',
        avatar: '',
        maxCapacity: 40,
        skills: []
      });
    }
    setErrors({});
    setSkillInput('');
  }, [member, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.maxCapacity < 1 || formData.maxCapacity > 80) {
      newErrors.maxCapacity = 'Max capacity must be between 1 and 80 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        startDate: member?.startDate || new Date().toISOString().split('T')[0],
        maxCapacity: parseInt(formData.maxCapacity)
      };
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member ? 'Edit Team Member' : 'Add Team Member'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              error={errors.role}
              placeholder="e.g. Senior Developer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.department ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="e.g. +1 (555) 123-4567"
            />
          </div>
          <div>
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              error={errors.location}
              placeholder="e.g. New York, NY"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <Input
              label="Max Weekly Capacity (hours)"
              type="number"
              min="1"
              max="80"
              value={formData.maxCapacity}
              onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
              error={errors.maxCapacity}
              required
            />
          </div>
        </div>

        <div>
          <Input
            label="Avatar URL"
            value={formData.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              placeholder="Enter a skill"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              variant="outline"
              size="sm"
              disabled={!skillInput.trim()}
            >
              <ApperIcon name="Plus" size={16} />
            </Button>
          </div>
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <ApperIcon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ApperIcon name="Loader" size={16} className="animate-spin mr-2" />
                {member ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              member ? 'Update Member' : 'Add Member'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TeamMemberForm;