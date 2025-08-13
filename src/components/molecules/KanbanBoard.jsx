import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import IssueCard from './IssueCard';
import ApperIcon from '@/components/ApperIcon';
import { statusWorkflow } from '@/services/api/issueService';
import { toast } from 'react-toastify';

const KanbanBoard = ({ issues, onUpdateIssue, onIssueClick }) => {
  const [columnIssues, setColumnIssues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Group issues by status
    const grouped = statusWorkflow.reduce((acc, status) => {
      acc[status] = issues.filter(issue => issue.status === status);
      return acc;
    }, {});
    
    setColumnIssues(grouped);
  }, [issues]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Check if dropped outside of any droppable area
    if (!destination) {
      return;
    }

    // Check if the position changed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const issueId = parseInt(draggableId);

    // Find the issue being moved
    const movedIssue = issues.find(issue => issue.Id === issueId);
    if (!movedIssue) return;

    // Create new column state
    const newColumnIssues = { ...columnIssues };

    // Remove from source column
    newColumnIssues[sourceStatus] = newColumnIssues[sourceStatus].filter(
      issue => issue.Id !== issueId
    );

    // Add to destination column
    const updatedIssue = { ...movedIssue, status: destStatus };
    newColumnIssues[destStatus].splice(destination.index, 0, updatedIssue);

    // Update local state immediately for smooth UX
    setColumnIssues(newColumnIssues);

    // Update the issue in the backend
    setLoading(true);
    try {
      await onUpdateIssue(issueId, { status: destStatus });
      toast.success(`Issue moved to ${destStatus}`);
    } catch (error) {
      // Revert the change if update fails
      setColumnIssues(prevState => {
        const revertedState = { ...prevState };
        revertedState[destStatus] = revertedState[destStatus].filter(
          issue => issue.Id !== issueId
        );
        revertedState[sourceStatus].splice(source.index, 0, movedIssue);
        return revertedState;
      });
      
      toast.error('Failed to update issue status');
      console.error('Error updating issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnColor = (status) => {
    switch (status) {
      case 'To Do': return 'border-gray-300 bg-gray-50';
      case 'In Progress': return 'border-blue-300 bg-blue-50';
      case 'In Review': return 'border-yellow-300 bg-yellow-50';
      case 'Done': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getColumnIcon = (status) => {
    switch (status) {
      case 'To Do': return 'Circle';
      case 'In Progress': return 'Clock';
      case 'In Review': return 'Eye';
      case 'Done': return 'CheckCircle2';
      default: return 'Circle';
    }
  };

  const getColumnIconColor = (status) => {
    switch (status) {
      case 'To Do': return 'text-gray-500';
      case 'In Progress': return 'text-blue-500';
      case 'In Review': return 'text-yellow-500';
      case 'Done': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {statusWorkflow.map((status) => (
            <div key={status} className="flex flex-col h-full">
              <div className={`kanban-header p-4 rounded-t-lg border-2 ${getColumnColor(status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ApperIcon 
                      name={getColumnIcon(status)} 
                      size={18} 
                      className={getColumnIconColor(status)} 
                    />
                    <h3 className="font-semibold text-gray-900">{status}</h3>
                  </div>
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                    {columnIssues[status]?.length || 0}
                  </span>
                </div>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 border-2 border-t-0 rounded-b-lg kanban-column ${
                      snapshot.isDraggingOver ? 'drag-over' : ''
                    } ${getColumnColor(status)}`}
                  >
                    <div className="kanban-tasks space-y-3">
                      {(columnIssues[status] || []).map((issue, index) => (
                        <Draggable
                          key={issue.Id}
                          draggableId={issue.Id.toString()}
                          index={index}
                          isDragDisabled={loading}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onIssueClick(issue)}
                              className="cursor-pointer"
                            >
                              <IssueCard
                                issue={issue}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty state */}
                      {(!columnIssues[status] || columnIssues[status].length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <ApperIcon name="Package" size={32} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No issues in {status.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
            <ApperIcon name="Loader2" size={20} className="animate-spin text-blue-500" />
            <span className="text-gray-700">Updating issue status...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;