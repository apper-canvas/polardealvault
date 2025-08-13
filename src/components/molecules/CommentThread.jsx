import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const CommentThread = ({ 
  comment, 
  replies = [], 
  teamMembers = [], 
  onReply, 
  onEdit, 
  onDelete 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const getAuthor = (authorId) => {
    return teamMembers.find(member => member.Id === authorId) || {
      name: 'Unknown User',
      email: 'unknown@example.com'
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const parseContentWithMentions = (content) => {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <span key={index} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    onReply(comment.Id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    onEdit(comment.Id, editContent);
    setIsEditing(false);
  };

  const handleInputChange = (value, setter) => {
    setter(value);
    
    // Check for @ mention
    const mentionMatch = value.match(/@([a-zA-Z0-9._-]*)$/);
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member, currentValue, setter) => {
    const mentionMatch = currentValue.match(/(.*)@([a-zA-Z0-9._-]*)$/);
    if (mentionMatch) {
      const newValue = `${mentionMatch[1]}@${member.email.split('@')[0]} `;
      setter(newValue);
      setShowMentions(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    member.email.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const author = getAuthor(comment.authorId);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Main Comment */}
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {author.name.charAt(0)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{author.name}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="relative">
              <textarea
                value={editContent}
                onChange={(e) => handleInputChange(e.target.value, setEditContent)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows="2"
                autoFocus
              />
              
              {/* Mentions Dropdown for Edit */}
              {showMentions && filteredMembers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredMembers.slice(0, 5).map(member => (
                    <button
                      key={member.Id}
                      type="button"
                      onClick={() => insertMention(member, editContent, setEditContent)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
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
              
              <div className="flex space-x-2 mt-2">
                <Button type="submit" variant="primary" size="sm">
                  Save
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-gray-700 mb-2">
              {parseContentWithMentions(comment.content)}
            </div>
          )}
          
          {!isEditing && (
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="hover:text-gray-700 flex items-center"
              >
                <ApperIcon name="Reply" size={12} className="mr-1" />
                Reply
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="hover:text-gray-700 flex items-center"
              >
                <ApperIcon name="Edit2" size={12} className="mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(comment.Id)}
                className="hover:text-red-600 flex items-center"
              >
                <ApperIcon name="Trash2" size={12} className="mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 ml-11">
          <form onSubmit={handleReplySubmit} className="relative">
            <textarea
              value={replyContent}
              onChange={(e) => handleInputChange(e.target.value, setReplyContent)}
              placeholder="Write a reply... Use @username to mention"
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows="2"
              autoFocus
            />
            
            {/* Mentions Dropdown for Reply */}
            {showMentions && filteredMembers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredMembers.slice(0, 5).map(member => (
                  <button
                    key={member.Id}
                    type="button"
                    onClick={() => insertMention(member, replyContent, setReplyContent)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
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
            
            <div className="flex space-x-2 mt-2">
              <Button 
                type="submit" 
                variant="primary" 
                size="sm"
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-4 ml-11 space-y-3">
          {replies.map(reply => (
            <CommentThread
              key={reply.Id}
              comment={reply}
              replies={[]}
              teamMembers={teamMembers}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;