import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { useTimer } from '@/contexts/TimerContext';
import { cn } from '@/utils/cn';

const TimerWidget = () => {
  const {
    isRunning,
    isPaused,
    duration,
    selectedProjectId,
    description,
    projects,
    isWidgetVisible,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setDescription,
    setIsWidgetVisible,
    formatDuration
  } = useTimer();

const [isExpanded, setIsExpanded] = useState(false);
  const [newProjectId, setNewProjectId] = useState(selectedProjectId || '');
  const [newDescription, setNewDescription] = useState(description || '');
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [manualTime, setManualTime] = useState('');

  if (!isWidgetVisible && !isRunning) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsWidgetVisible(true)}
          variant="primary"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-3"
        >
          <ApperIcon name="Clock" size={20} className="mr-2" />
          Start Timer
        </Button>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.Id === selectedProjectId);

  const handleStart = () => {
    if (newProjectId && projects.length > 0) {
      startTimer(newProjectId, newDescription);
      setIsExpanded(false);
    }
  };

  const handleStop = () => {
    stopTimer();
    setIsExpanded(false);
};

  const handleAddTime = () => {
    if (manualTime && !isNaN(parseFloat(manualTime))) {
      const additionalSeconds = parseFloat(manualTime) * 3600;
      // In a real implementation, this would update the timer duration
      setManualTime('');
      setShowTimeInput(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        "bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 transform",
        isExpanded ? "w-80" : "w-auto"
      )}>
        {/* Collapsed View */}
        {!isExpanded && (
<div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isRunning && !isPaused ? "bg-green-500 animate-pulse" : 
                  isPaused ? "bg-yellow-500" : "bg-gray-400"
                )} />
                <div>
                  <div className="font-mono text-xl font-bold text-gray-900">
                    {formatDuration(duration)}
                  </div>
                  {selectedProject && (
                    <div className="text-xs text-gray-600 truncate max-w-32">
                      {selectedProject.name}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isRunning ? (
                  <>
                    <Button
                      onClick={isPaused ? resumeTimer : pauseTimer}
                      variant="secondary"
                      size="sm"
                      className="p-2"
                    >
                      <ApperIcon name={isPaused ? "Play" : "Pause"} size={16} />
                    </Button>
                    <Button
                      onClick={handleStop}
                      variant="primary"
                      size="sm"
                      className="p-2"
                    >
                      <ApperIcon name="Square" size={16} />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsExpanded(true)}
                    variant="primary"
                    size="sm"
                    className="p-2"
                  >
                    <ApperIcon name="Play" size={16} />
                  </Button>
                )}
                
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <ApperIcon name={isExpanded ? "ChevronDown" : "ChevronUp"} size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Timer</h3>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <ApperIcon name="X" size={16} />
              </Button>
</div>

            {/* Timer Display */}
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-gray-900 mb-2">
                {formatDuration(duration)}
              </div>
              <div className={cn(
                "inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm mb-3",
                isRunning && !isPaused ? "bg-green-100 text-green-800" :
                isPaused ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-600"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isRunning && !isPaused ? "bg-green-500 animate-pulse" :
                  isPaused ? "bg-yellow-500" : "bg-gray-400"
                )} />
                <span>
                  {isRunning && !isPaused ? "Running" : 
                   isPaused ? "Paused" : "Stopped"}
                </span>
              </div>
              
              {/* Manual Time Addition */}
              {isRunning && (
                <div className="text-center">
                  {!showTimeInput ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTimeInput(true)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      <ApperIcon name="Plus" size={12} className="mr-1" />
                      Add time manually
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 justify-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="24"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        placeholder="Hours"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddTime}
                        disabled={!manualTime || isNaN(parseFloat(manualTime))}
                        className="p-1"
                      >
                        <ApperIcon name="Plus" size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowTimeInput(false);
                          setManualTime('');
                        }}
                        className="p-1"
                      >
                        <ApperIcon name="X" size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Project Selection */}
            {!isRunning && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.Id} value={project.Id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            {!isRunning && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Current Task Info */}
            {isRunning && selectedProject && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {selectedProject.name}
                </div>
                {description && (
                  <div className="text-sm text-gray-600">
                    {description}
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between space-x-2">
              {isRunning ? (
                <>
                  <Button
                    onClick={isPaused ? resumeTimer : pauseTimer}
                    variant="secondary"
                    className="flex-1"
                  >
                    <ApperIcon name={isPaused ? "Play" : "Pause"} size={16} className="mr-2" />
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    onClick={handleStop}
                    variant="primary"
                    className="flex-1"
                  >
                    <ApperIcon name="Square" size={16} className="mr-2" />
                    Stop & Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsWidgetVisible(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    <ApperIcon name="X" size={16} className="mr-2" />
                    Close
                  </Button>
                  <Button
                    onClick={handleStart}
                    variant="primary"
                    className="flex-1"
                    disabled={!newProjectId}
                  >
                    <ApperIcon name="Play" size={16} className="mr-2" />
                    Start
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerWidget;