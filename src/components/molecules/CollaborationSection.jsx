import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CommentThread from '@/components/molecules/CommentThread';
import FileAttachment from '@/components/molecules/FileAttachment';
import commentService from '@/services/api/commentService';
import fileService from '@/services/api/fileService';
import { getAll as getTeamMembers } from '@/services/api/teamMemberService';

const CollaborationSection = ({ 
  taskId = null, 
  projectId = null, 
  isExpanded = false, 
  onToggle 
}) => {
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load data when expanded
  useEffect(() => {
    if (isExpanded) {
      loadCollaborationData();
    }
  }, [isExpanded, taskId, projectId]);

  const loadCollaborationData = async () => {
    try {
      setLoading(true);
      const [commentsData, filesData, membersData] = await Promise.all([
        taskId ? commentService.getByTaskId(taskId) : commentService.getByProjectId(projectId),
        taskId ? fileService.getByTaskId(taskId) : fileService.getByProjectId(projectId),
        getTeamMembers()
      ]);
      setComments(commentsData);
      setFiles(filesData);
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
      toast.error('Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        taskId,
        projectId,
        authorId: 1, // In real app, get from auth context
        content: newComment.trim()
      };

      const createdComment = await commentService.create(commentData);
      setComments(prev => [...prev, createdComment]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleCommentReply = async (parentId, content) => {
    try {
      const commentData = {
        taskId,
        projectId,
        authorId: 1,
        content: content.trim(),
        parentId
      };

      const createdComment = await commentService.create(commentData);
      setComments(prev => [...prev, createdComment]);
      toast.success('Reply added successfully!');
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleCommentEdit = async (commentId, newContent) => {
    try {
      const updatedComment = await commentService.update(commentId, { content: newContent });
      setComments(prev => prev.map(c => c.Id === commentId ? updatedComment : c));
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.delete(commentId);
      setComments(prev => prev.filter(c => c.Id !== commentId && c.parentId !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    try {
      const uploadPromises = Array.from(uploadedFiles).map(file => 
        fileService.upload({
          taskId,
          projectId,
          file,
          uploadedBy: 1
        })
      );

      const uploadedFileData = await Promise.all(uploadPromises);
      setFiles(prev => [...uploadedFileData, ...prev]);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload files');
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileService.delete(fileId);
      setFiles(prev => prev.filter(f => f.Id !== fileId));
      toast.success('File deleted successfully!');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Handle @ mentions
  const handleInputChange = (e) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    
    setNewComment(value);
    
    // Check for @ mention
    const beforeCursor = value.substring(0, selectionStart);
    const mentionMatch = beforeCursor.match(/@([a-zA-Z0-9._-]*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setMentionPosition(selectionStart - mentionMatch[1].length - 1);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member) => {
    const beforeMention = newComment.substring(0, mentionPosition);
    const afterMention = newComment.substring(mentionPosition + mentionSearch.length + 1);
    const newValue = `${beforeMention}@${member.email.split('@')[0]} ${afterMention}`;
    
    setNewComment(newValue);
    setShowMentions(false);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  // Filter mentions
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    member.email.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  // Group comments into threads
  const commentThreads = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  if (!isExpanded) {
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <ApperIcon name="MessageCircle" size={14} className="mr-1" />
            {comments.length} comments
          </span>
          <span className="flex items-center">
            <ApperIcon name="Paperclip" size={14} className="mr-1" />
            {files.length} files
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-blue-600 hover:text-blue-700"
        >
          <ApperIcon name="MessageSquare" size={14} className="mr-1" />
          Collaborate
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Collaboration</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          <ApperIcon name="ChevronUp" size={14} />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <ApperIcon name="Loader2" size={20} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <ApperIcon name="Upload" size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag files here or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500">
                Supports images, documents, and more
              </p>
            </div>
          </div>

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Attached Files ({files.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map(file => (
                  <FileAttachment
                    key={file.Id}
                    file={file}
                    onDelete={() => handleFileDelete(file.Id)}
                    teamMembers={teamMembers}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Discussion ({comments.length})
            </h5>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={handleInputChange}
                  placeholder="Add a comment... Use @username to mention team members"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
                
                {/* Mentions Dropdown */}
                {showMentions && filteredMembers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredMembers.slice(0, 5).map(member => (
                      <button
                        key={member.Id}
                        type="button"
                        onClick={() => insertMention(member)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">@{member.email.split('@')[0]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newComment.trim()}
                >
                  <ApperIcon name="Send" size={14} className="mr-1" />
                  Comment
                </Button>
              </div>
            </form>

            {/* Comment Threads */}
            <div className="space-y-4">
              {commentThreads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="MessageCircle" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                commentThreads.map(comment => (
                  <CommentThread
                    key={comment.Id}
                    comment={comment}
                    replies={getReplies(comment.Id)}
                    teamMembers={teamMembers}
                    onReply={handleCommentReply}
                    onEdit={handleCommentEdit}
                    onDelete={handleCommentDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationSection;