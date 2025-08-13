import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const TimeEntryCard = ({ timeEntry, project, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0 && minutes > 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  };

const getProjectColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "On Hold":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Clock" size={16} className="text-blue-600" />
              <span className="text-lg font-semibold text-blue-600">
                {formatDuration(timeEntry.duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Calendar" size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(timeEntry.date)}
              </span>
            </div>
          </div>

          {project && (
<div className="flex items-center space-x-2 mb-3">
              <ApperIcon name="Briefcase" size={14} className="text-gray-500" />
              <span className="font-medium text-gray-900">{project.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProjectColor(project.status)}`}>
                {project.status}
              </span>
            </div>
          )}

          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {timeEntry.description}
          </p>

          <div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="Plus" size={12} className="mr-1" />
            Created {new Date(timeEntry.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(timeEntry)}
            className="text-gray-600 hover:text-blue-600"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(timeEntry.Id)}
            className="text-gray-600 hover:text-red-600"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TimeEntryCard;