import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import IssueForm from '@/components/molecules/IssueForm';
import CommentForm from '@/components/molecules/CommentForm';
import issueService, { issueTypes } from '@/services/api/issueService';
import projectService from '@/services/api/projectService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    loadIssueData();
  }, [id]);

  const loadIssueData = async () => {
    try {
      setLoading(true);
      const [issueData, commentsData, projectsData] = await Promise.all([
        issueService.getById(id),
        issueService.getCommentsByIssueId(id),
        projectService.getAll()
      ]);

      if (!issueData) {
        setError('Issue not found');
        return;
      }

      setIssue(issueData);
      setComments(commentsData);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      setError('Failed to load issue details');
      console.error('Error loading issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssue = async (updateData) => {
    try {
      const updatedIssue = await issueService.update(id, updateData);
      setIssue(updatedIssue);
      setShowEditForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    try {
      await issueService.remove(id);
      toast.success('Issue deleted successfully');
      navigate('/issues');
    } catch (error) {
      toast.error('Failed to delete issue');
      console.error('Error deleting issue:', error);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      const newComment = await issueService.createComment({
        ...commentData,
        issueId: parseInt(id),
        author: 'current.user@company.com' // In real app, get from auth context
      });
      
      setComments(prev => [...prev, newComment]);
      setReplyingTo(null);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateComment = async (commentId, updateData) => {
    try {
      const updatedComment = await issueService.updateComment(commentId, updateData);
      setComments(prev => prev.map(comment =>
        comment.Id === commentId ? updatedComment : comment
      ));
      setEditingComment(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await issueService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.Id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const getIssueType = () => {
    return issueTypes.find(type => type.id === issue?.type);
  };

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const buildCommentTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    // Create a map of all comments
    comments.forEach(comment => {
      commentMap[comment.Id] = { ...comment, replies: [] };
    });

    // Build the tree
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap[comment.parentId];
        if (parent) {
          parent.replies.push(commentMap[comment.Id]);
        }
      } else {
        rootComments.push(commentMap[comment.Id]);
      }
    });

    return rootComments;
  };

  const renderComment = (comment, depth = 0) => {
    const isEditing = editingComment === comment.Id;
    const isReplying = replyingTo === comment.Id;

    return (
      <div key={comment.Id} className={`${depth > 0 ? 'ml-8 border-l border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ApperIcon name="User" size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {comment.author.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(comment.createdAt), 'MMM dd, yyyy at h:mm a')}
                  {comment.updatedAt !== comment.createdAt && ' (edited)'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setEditingComment(comment.Id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <ApperIcon name="Edit2" size={14} />
              </button>
              <button
                onClick={() => handleDeleteComment(comment.Id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <ApperIcon name="Trash2" size={14} />
              </button>
            </div>
          </div>

          {isEditing ? (
            <CommentForm
              initialContent={comment.content}
              onSubmit={({ content }) => handleUpdateComment(comment.Id, { content })}
              onCancel={() => setEditingComment(null)}
              isEdit={true}
            />
          ) : (
            <>
              <div 
                className="prose prose-sm max-w-none mb-3"
                dangerouslySetInnerHTML={{ 
                  __html: comment.content.replace(
                    /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
                    '<span class="bg-blue-100 text-blue-800 px-1 rounded">@$1</span>'
                  )
                }}
              />
              
              <button
                onClick={() => setReplyingTo(comment.Id)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <ApperIcon name="Reply" size={14} className="inline mr-1" />
                Reply
              </button>
            </>
          )}
        </div>

        {isReplying && (
          <div className="ml-4 mb-4">
            <CommentForm
              parentId={comment.Id}
              onSubmit={handleAddComment}
              onCancel={() => setReplyingTo(null)}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!issue) return <Error message="Issue not found" />;

  const issueType = getIssueType();
  const project = projects.find(p => p.Id === issue.projectId);
  const commentTree = buildCommentTree(comments);
  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'Done';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/issues" className="hover:text-blue-600">Issues</Link>
        <ApperIcon name="ChevronRight" size={16} />
        <span className="text-gray-900">#{issue.Id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg border ${issueType?.bgColor} ${issueType?.borderColor}`}>
              <ApperIcon 
                name={issueType?.icon || 'Circle'} 
                size={20} 
                className={issueType?.color || 'text-gray-600'} 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>#{issue.Id}</span>
                <span>•</span>
                <span>Created {format(new Date(issue.createdAt), 'MMM dd, yyyy')}</span>
                {isOverdue && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium">
                      <ApperIcon name="AlertTriangle" size={14} className="inline mr-1" />
                      Overdue
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <ApperIcon name="Edit2" size={16} className="mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteIssue}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: issue.description }}
              />
            </div>
          </Card>

          {/* Attachments */}
          {issue.attachments && issue.attachments.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                <div className="space-y-3">
                  {issue.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ApperIcon name="Paperclip" size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(attachment.size)} • {attachment.type}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ApperIcon name="Download" size={16} className="mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
              </h2>
              
              {/* Add Comment */}
              <div className="mb-6">
                <CommentForm onSubmit={handleAddComment} />
              </div>

              {/* Comment Thread */}
              <div className="space-y-4">
                {commentTree.length > 0 ? (
                  commentTree.map(comment => renderComment(comment))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ApperIcon name="MessageCircle" size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Priority</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Assignment */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="User" size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{issue.reporter}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="User" size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {issue.assignee || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {issue.environment}
                  </span>
                </div>
                
                {project && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <Link 
                      to={`/projects/${project.Id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {project.name}
                    </Link>
                  </div>
                )}

                {issue.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <div className={`flex items-center space-x-2 ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      <ApperIcon name="Calendar" size={16} />
                      <span className="text-sm">
                        {format(new Date(issue.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <ApperIcon name="Clock" size={16} className="text-gray-400" />
                    <span className="text-sm">
                      {format(new Date(issue.updatedAt), 'MMM dd, yyyy at h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          {issue.tags && issue.tags.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <IssueForm
        issue={issue}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdateIssue}
        projects={projects}
      />
    </div>
  );
};

export default IssueDetail;