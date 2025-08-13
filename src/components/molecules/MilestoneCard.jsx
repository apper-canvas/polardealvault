import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const MilestoneCard = ({ milestone, onEdit, onDelete, onToggleComplete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusInfo = () => {
    if (milestone.isCompleted) {
      return {
        status: 'Completed',
        className: 'milestone-status-completed',
        icon: 'CheckCircle'
      };
    }

    const dueDate = new Date(milestone.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'Overdue',
        className: 'milestone-status-overdue',
        icon: 'AlertCircle'
      };
    } else if (diffDays <= 7) {
      return {
        status: 'Due Soon',
        className: 'milestone-status-upcoming',
        icon: 'Clock'
      };
    } else {
      return {
        status: 'Upcoming',
className: 'status-in-progress',
        icon: 'Flag'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900 truncate">
              {milestone.title}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${statusInfo.className}`}>
              {statusInfo.status}
            </span>
          </div>
          
          {milestone.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {milestone.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 mb-3">
            <ApperIcon name="Calendar" size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">
              Due: {formatDate(milestone.dueDate)}
            </span>
          </div>

          {milestone.isCompleted && milestone.completedDate && (
            <div className="flex items-center gap-1">
              <ApperIcon name="CheckCircle" size={14} className="text-green-500" />
              <span className="text-xs text-green-600">
                Completed: {formatDate(milestone.completedDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleComplete(milestone.Id, !milestone.isCompleted)}
          className={`flex items-center gap-1 text-xs ${
            milestone.isCompleted ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
          }`}
        >
          <ApperIcon 
            name={milestone.isCompleted ? "RotateCcw" : "Check"} 
            size={14} 
          />
          {milestone.isCompleted ? 'Reopen' : 'Complete'}
        </Button>

        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(milestone)}
            className="p-2"
          >
            <ApperIcon name="Edit2" size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(milestone.Id)}
            className="p-2 hover:text-red-600"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MilestoneCard;