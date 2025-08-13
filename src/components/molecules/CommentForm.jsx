import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const CommentForm = ({ onSubmit, parentId = null, initialContent = '', onCancel = null, isEdit = false, taskId }) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);
  const mentionsRef = useRef(null);

  // Mock team members for mentions
  const teamMembers = [
    'john.doe@company.com',
    'jane.smith@company.com',
    'alice.johnson@company.com',
    'bob.wilson@company.com',
    'charlie.brown@company.com',
    'diana.prince@company.com'
  ];

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mentionsRef.current && !mentionsRef.current.contains(event.target)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);
    try {
await onSubmit({
        content: content.trim(),
        parentId,
        taskId
      });
      
      if (!isEdit) {
        setContent('');
      }
      toast.success(isEdit ? 'Comment updated' : 'Comment added');
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      toast.error('Failed to save comment');
      console.error('Error saving comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setContent(value);

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);

    if (mentionMatch) {
      const search = mentionMatch[1].toLowerCase();
      setMentionSearch(search);
      
      // Calculate position for mentions dropdown
      const textarea = e.target;
      const { offsetTop, offsetLeft } = textarea;
      const textMetrics = getTextMetrics(textBeforeCursor, textarea);
      
      setMentionPosition({
        top: offsetTop + textMetrics.height + 5,
        left: offsetLeft + textMetrics.width
      });
      
      // Filter team members based on search
      const filteredMembers = teamMembers.filter(member =>
        member.toLowerCase().includes(search)
      );
      setMentions(filteredMembers.slice(0, 5));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const getTextMetrics = (text, textarea) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const styles = window.getComputedStyle(textarea);
    
    context.font = `${styles.fontSize} ${styles.fontFamily}`;
    
    const lines = text.split('\n');
    const lineHeight = parseInt(styles.lineHeight) || parseInt(styles.fontSize) * 1.2;
    
    return {
      width: Math.max(...lines.map(line => context.measureText(line).width)),
      height: lines.length * lineHeight
    };
  };

  const handleMentionSelect = (member) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    
    // Find the @ symbol position
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const beforeMention = content.substring(0, mentionStart);
    
    const newContent = `${beforeMention}@${member} ${textAfterCursor}`;
    setContent(newContent);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current.focus();
      const newCursorPosition = mentionStart + member.length + 2;
      textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={parentId ? "Reply to comment..." : "Add a comment... Use @ to mention team members"}
            rows={parentId ? 3 : 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            disabled={loading}
          />
          
          {/* Mentions Dropdown */}
          {showMentions && mentions.length > 0 && (
            <div
              ref={mentionsRef}
              className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
              style={{
                top: mentionPosition.top,
                left: Math.min(mentionPosition.left, window.innerWidth - 250)
              }}
            >
              {mentions.map((member, index) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => handleMentionSelect(member)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="User" size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{member}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <ApperIcon name="Info" size={12} className="inline mr-1" />
            Press Ctrl+Enter to submit quickly
          </div>
          
          <div className="flex space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={loading || !content.trim()}
              className="min-w-[80px]"
            >
              {loading ? (
                <ApperIcon name="Loader2" size={14} className="animate-spin" />
              ) : (
                isEdit ? 'Update' : 'Comment'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;