import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import CollaborationSection from "@/components/molecules/CollaborationSection";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const TaskCard = ({ task, project, onEdit, onDelete, onToggleComplete, compact = false, kanban = false }) => {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const navigate = useNavigate();
  const handleToggleComplete = () => {
    onToggleComplete(task.Id, !task.completed);
  };

  return (
    <Card className="p-6 hover:card-shadow-hover transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggleComplete}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 hover:border-green-400"
            }`}
          >
            {task.completed && <ApperIcon name="Check" size={12} />}
          </button>
<div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                className={`font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors ${task.completed ? 'line-through text-gray-500' : ''}`}
                onClick={() => navigate(`/tasks/${task.Id}`)}
              >
                {task.name}
              </h3>
              {task.priority && (
<span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' 
                    ? 'status-urgent' 
                    : task.priority === 'Medium'
                    ? 'status-in-progress'
                    : 'status-completed'
                }`}>
                  {task.priority}
                </span>
              )}
            </div>
            {task.description && (
              <p className={`text-sm mb-3 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {project && (
                <div className="flex items-center">
                  <ApperIcon name="Briefcase" size={12} className="mr-1" />
                  {project.name}
                </div>
              )}
              {task.dueDate && (
                <div className={`flex items-center ${
                  new Date(task.dueDate) < new Date() && !task.completed 
                    ? 'text-red-600 font-medium' 
                    : ''
                }`}>
                  <ApperIcon name="Calendar" size={12} className="mr-1" />
                  Due {new Date(task.dueDate).toLocaleDateString()}
                  {new Date(task.dueDate) < new Date() && !task.completed && (
                    <ApperIcon name="AlertCircle" size={12} className="ml-1 text-red-600" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
<div className="flex items-center space-x-1 ml-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="Edit2" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.Id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
</div>
      
      {!kanban && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.completed 
              ? 'status-completed' 
              : 'status-in-progress'
          }`}>
            {task.completed ? 'Completed' : 'In Progress'}
          </span>
          <span>
            Created {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {kanban && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.completed 
              ? 'status-completed' 
              : task.status === 'inprogress'
              ? 'status-in-progress'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {task.completed ? 'Done' : task.status === 'inprogress' ? 'In Progress' : 'To Do'}
          </span>
          {task.dueDate && (
            <span className={`text-xs ${
              new Date(task.dueDate) < new Date() && !task.completed 
                ? 'text-red-600 font-medium' 
                : 'text-gray-500'
            }`}>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {!kanban && (
        <CollaborationSection
          taskId={task.Id}
          isExpanded={showCollaboration}
          onToggle={() => setShowCollaboration(!showCollaboration)}
        />
      )}
    </Card>
  );
};

export default TaskCard;