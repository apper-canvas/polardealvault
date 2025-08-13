import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
         differenceInDays, parseISO, isWithinInterval, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const TimelineView = ({ 
  tasks, 
  milestones, 
  project, 
  onTaskUpdate, 
  onTaskEdit, 
  onTaskCreate,
  view,
  onViewChange,
  startDate,
  onStartDateChange
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [showDependencies, setShowDependencies] = useState(true);
  const [criticalPath, setCriticalPath] = useState([]);
  const timelineRef = useRef(null);

  // Calculate timeline bounds
  const getTimelineBounds = () => {
    const now = new Date();
    let start, end;
    
    switch (view) {
      case 'week':
        start = startOfWeek(startDate);
        end = endOfWeek(addDays(startDate, 6));
        break;
      case 'month':
        start = startOfMonth(startDate);
        end = endOfMonth(startDate);
        break;
      case 'quarter':
        start = startOfMonth(startDate);
        end = endOfMonth(addDays(startDate, 90));
        break;
      default:
        start = startOfMonth(startDate);
        end = endOfMonth(startDate);
    }
    
    return { start, end };
  };

  const { start: timelineStart, end: timelineEnd } = getTimelineBounds();
  const totalDays = differenceInDays(timelineEnd, timelineStart) + 1;

  // Calculate critical path
  useEffect(() => {
    if (tasks.length > 0) {
      setCriticalPath(calculateCriticalPath(tasks));
    }
  }, [tasks]);

  const calculateCriticalPath = (taskList) => {
    // Simplified critical path calculation
    const taskMap = new Map(taskList.map(t => [t.Id, t]));
    const visited = new Set();
    const path = [];

    const findLongestPath = (taskId, currentPath = []) => {
      if (visited.has(taskId)) return currentPath;
      
      const task = taskMap.get(taskId);
      if (!task) return currentPath;
      
      visited.add(taskId);
      const newPath = [...currentPath, taskId];
      
      if (!task.dependencies?.length) {
        return newPath;
      }
      
      let longestPath = newPath;
      task.dependencies.forEach(depId => {
        const depPath = findLongestPath(depId, newPath);
        if (depPath.length > longestPath.length) {
          longestPath = depPath;
        }
      });
      
      return longestPath;
    };

    taskList.forEach(task => {
      if (!visited.has(task.Id)) {
        const taskPath = findLongestPath(task.Id);
        if (taskPath.length > path.length) {
          path.splice(0, path.length, ...taskPath);
        }
      }
    });

    return path;
  };

  // Get task position and width
  const getTaskStyle = (task) => {
    const startDate = task.startDate ? parseISO(task.startDate) : new Date();
    const endDate = task.dueDate ? parseISO(task.dueDate) : addDays(startDate, 1);
    
    const startOffset = Math.max(0, differenceInDays(startDate, timelineStart));
    const duration = Math.max(1, differenceInDays(endDate, startDate) + 1);
    
    const left = (startOffset / totalDays) * 100;
    const width = Math.min((duration / totalDays) * 100, 100 - left);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Get task color based on status and critical path
  const getTaskColor = (task) => {
    const isCritical = criticalPath.includes(task.Id);
    
    if (task.completed) {
      return isCritical ? 'bg-green-600' : 'bg-green-500';
    }
    
    if (isCritical) {
      return 'bg-red-500';
    }
    
    switch (task.priority) {
      case 'High':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-blue-500';
      case 'Low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Handle task drag
  const handleTaskDrag = (task, newStartDate) => {
    const duration = task.dueDate 
      ? differenceInDays(parseISO(task.dueDate), parseISO(task.startDate || new Date()))
      : 1;
    
    const newEndDate = addDays(newStartDate, duration);
    
    onTaskUpdate(task.Id, {
      startDate: newStartDate.toISOString(),
      dueDate: newEndDate.toISOString()
    });
  };

  // Render dependency lines
  const renderDependencies = () => {
    if (!showDependencies) return null;
    
    return tasks.map(task => {
      if (!task.dependencies?.length) return null;
      
      return task.dependencies.map(depId => {
        const depTask = tasks.find(t => t.Id === depId);
        if (!depTask) return null;
        
        const fromStyle = getTaskStyle(depTask);
        const toStyle = getTaskStyle(task);
        
        return (
          <div
            key={`${depId}-${task.Id}`}
            className="absolute h-0.5 bg-gray-400 z-10 dependency-line"
            style={{
              left: `calc(${fromStyle.left} + ${fromStyle.width})`,
              top: '50%',
              width: `calc(${toStyle.left} - ${fromStyle.left} - ${fromStyle.width})`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <ApperIcon name="ChevronRight" size={12} className="text-gray-400" />
            </div>
          </div>
        );
      });
    });
  };

  // Generate timeline dates
  const generateTimelineDates = () => {
    const dates = [];
    for (let i = 0; i < totalDays; i++) {
      dates.push(addDays(timelineStart, i));
    }
    return dates;
  };

  const timelineDates = generateTimelineDates();

  return (
    <Card className="p-6">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['week', 'month', 'quarter'].map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartDateChange(addDays(startDate, -totalDays))}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
              {format(timelineStart, 'MMM d, yyyy')} - {format(timelineEnd, 'MMM d, yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartDateChange(addDays(startDate, totalDays))}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDependencies(!showDependencies)}
            className={showDependencies ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
          >
            <ApperIcon name="GitBranch" size={16} className="mr-1.5" />
            Dependencies
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTaskCreate}
          >
            <ApperIcon name="Plus" size={16} className="mr-1.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <div className="w-64 flex-shrink-0 px-4 py-3 bg-gray-50 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-700">Task</span>
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {timelineDates.map((date, index) => (
                <div
                  key={date.toISOString()}
                  className={`flex-1 px-2 py-3 text-center border-r border-gray-100 ${
                    isSameDay(date, new Date()) ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                  style={{ minWidth: `${100 / totalDays}%` }}
                >
                  <div className="text-xs text-gray-600">
                    {format(date, view === 'week' ? 'EEE' : 'd')}
                  </div>
                  {view !== 'week' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {format(date, 'MMM')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Today indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
              style={{
                left: `${(differenceInDays(new Date(), timelineStart) / totalDays) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative" ref={timelineRef}>
        {tasks.map((task, index) => (
          <div key={task.Id} className="flex border-b border-gray-100 hover:bg-gray-50">
            {/* Task Info */}
            <div className="w-64 flex-shrink-0 px-4 py-4 border-r border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getTaskColor(task)}`}
                  title={criticalPath.includes(task.Id) ? 'Critical Path' : task.priority}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {task.assignee || 'Unassigned'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskEdit(task)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ApperIcon name="Edit" size={12} />
                </Button>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="flex-1 relative px-2 py-4" style={{ minHeight: '60px' }}>
              <div className="relative h-6">
                {/* Task Bar */}
                <motion.div
                  className={`absolute h-6 rounded-md cursor-pointer z-10 ${getTaskColor(task)} ${
                    task.completed ? 'opacity-80' : ''
                  }`}
                  style={getTaskStyle(task)}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTask(task)}
                  title={`${task.title} - ${task.priority} Priority`}
                >
                  <div className="flex items-center h-full px-2">
                    <span className="text-xs text-white font-medium truncate">
                      {task.title}
                    </span>
                    {task.completed && (
                      <ApperIcon name="Check" size={12} className="text-white ml-1" />
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {!task.completed && task.progress > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-md"
                      style={{ width: `${task.progress}%` }}
                    />
                  )}
                </motion.div>

                {/* Dependencies */}
                {renderDependencies()}

                {/* Milestones */}
                {milestones.map(milestone => {
                  const milestoneDate = parseISO(milestone.dueDate);
                  if (!isWithinInterval(milestoneDate, { start: timelineStart, end: timelineEnd })) {
                    return null;
                  }
                  
                  const offset = (differenceInDays(milestoneDate, timelineStart) / totalDays) * 100;
                  
                  return (
                    <div
                      key={milestone.Id}
                      className="absolute top-0 bottom-0 z-15"
                      style={{ left: `${offset}%` }}
                    >
                      <div className="w-0.5 h-full bg-purple-500" />
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white" />
                      <div className="absolute top-6 -left-6 text-xs text-purple-700 font-medium whitespace-nowrap">
                        {milestone.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Critical Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-500" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Milestone</span>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTask.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    selectedTask.completed ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {selectedTask.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className="text-sm font-medium">{selectedTask.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assignee:</span>
                  <span className="text-sm">{selectedTask.assignee || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="text-sm">
                    {selectedTask.dueDate ? format(parseISO(selectedTask.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </span>
                </div>
                {selectedTask.description && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Description:</span>
                    <p className="text-sm text-gray-900">{selectedTask.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onTaskEdit(selectedTask);
                    setSelectedTask(null);
                  }}
                  className="flex-1"
                >
                  <ApperIcon name="Edit" size={16} className="mr-1.5" />
                  Edit Task
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default TimelineView;