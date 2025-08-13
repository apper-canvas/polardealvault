import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const CalendarEventForm = ({ event, teamMembers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting',
    startDate: '',
    endDate: '',
    location: '',
    isAllDay: false,
    invitees: []
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        type: event.type || 'meeting',
        startDate: event.startDate ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm") : '',
        endDate: event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : '',
        location: event.location || '',
        isAllDay: event.isAllDay || false,
        invitees: event.invitees || []
      });
    } else {
      // Set default start time to now
      const now = new Date();
      const startTime = format(now, "yyyy-MM-dd'T'HH:mm");
      const endTime = format(new Date(now.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm");
      
      setFormData(prev => ({
        ...prev,
        startDate: startTime,
        endDate: endTime
      }));
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInviteeToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      invitees: prev.invitees.includes(memberId)
        ? prev.invitees.filter(id => id !== memberId)
        : [...prev.invitees, memberId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }

    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      location: formData.location.trim(),
      isAllDay: formData.isAllDay,
      invitees: formData.invitees
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Title
        </label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter event title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="meeting">Meeting</option>
          <option value="deadline">Deadline</option>
          <option value="milestone">Milestone</option>
          <option value="review">Review</option>
          <option value="presentation">Presentation</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Event description (optional)"
          className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isAllDay"
            checked={formData.isAllDay}
            onChange={handleInputChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">All day event</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date & Time
          </label>
          <Input
            type={formData.isAllDay ? "date" : "datetime-local"}
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time
          </label>
          <Input
            type={formData.isAllDay ? "date" : "datetime-local"}
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location (optional)
        </label>
        <Input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Meeting room, video call link, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Invite Team Members
        </label>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-gray-500">No team members available</p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <label key={member.Id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.invitees.includes(member.Id)}
                    onChange={() => handleInviteeToggle(member.Id)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{member.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({member.role})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default CalendarEventForm;