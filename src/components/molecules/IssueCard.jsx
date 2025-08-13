import React from 'react';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import { issueTypes, priorityLevels } from '@/services/api/issueService';
import { format } from 'date-fns';

const IssueCard = ({ issue, isDragging = false, dragHandleProps = {} }) => {
  const issueType = issueTypes.find(type => type.id === issue.type);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Highest': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';  
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Lowest': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'In Review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Done': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'Done';

  return (
    <div
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
        isDragging ? 'kanban-task-card dragging' : 'kanban-task-card'
      } ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
      {...dragHandleProps}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md border ${issueType?.bgColor} ${issueType?.borderColor}`}>
            <ApperIcon 
              name={issueType?.icon || 'Circle'} 
              size={14} 
              className={issueType?.color || 'text-gray-600'} 
            />
          </div>
          <span className="text-xs font-medium text-gray-500">#{issue.Id}</span>
        </div>
        <div className="flex items-center space-x-1">
          {isOverdue && (
            <ApperIcon name="AlertTriangle" size={14} className="text-red-500" />
          )}
          {issue.attachments && issue.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <ApperIcon name="Paperclip" size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{issue.attachments.length}</span>
            </div>
          )}
        </div>
      </div>

      <Link to={`/issues/${issue.Id}`} className="block mb-3 group">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {issue.title}
        </h3>
      </Link>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{issue.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
          {issue.status}
        </span>
      </div>

      {issue.tags && issue.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {issue.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{issue.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <ApperIcon name="User" size={12} />
          <span>{issue.assignee ? issue.assignee.split('@')[0] : 'Unassigned'}</span>
        </div>
        {issue.dueDate && (
          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
            <ApperIcon name="Calendar" size={12} />
            <span>{format(new Date(issue.dueDate), 'MMM dd')}</span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className={`px-2 py-1 rounded-full bg-gray-100`}>
            {issue.environment}
          </span>
          <span>Updated {format(new Date(issue.updatedAt), 'MMM dd')}</span>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;