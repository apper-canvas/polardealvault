import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const WikiDocumentForm = ({ document, content, onContentChange, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'documentation',
    tags: ''
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        type: document.type || 'documentation',
        tags: document.tags ? document.tags.join(', ') : ''
      });
    }
  }, [document]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Document title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Document content is required');
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      type: formData.type,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onSubmit(submitData);
  };

  const insertFormatting = (format) => {
    const textarea = document.getElementById('wiki-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'heading':
        newText = `## ${selectedText}`;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    onContentChange(newContent);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter document title"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="documentation">Documentation</option>
            <option value="meeting-notes">Meeting Notes</option>
            <option value="requirements">Requirements</option>
            <option value="specifications">Specifications</option>
            <option value="guide">Guide</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <Input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="project, documentation, important"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-300 rounded-t-md">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('bold')}
            title="Bold"
          >
            <ApperIcon name="Bold" size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('italic')}
            title="Italic"
          >
            <ApperIcon name="Italic" size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('heading')}
            title="Heading"
          >
            <ApperIcon name="Heading" size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('list')}
            title="List"
          >
            <ApperIcon name="List" size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('link')}
            title="Link"
          >
            <ApperIcon name="Link" size={16} />
          </Button>
        </div>
        
        <textarea
          id="wiki-content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Write your document content here... You can use Markdown formatting."
          className="w-full h-64 px-3 py-2 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
        
        <p className="text-xs text-gray-500 mt-1">
          Supports Markdown formatting. Use the toolbar above for common formatting options.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {document ? 'Update Document' : 'Create Document'}
        </Button>
      </div>
    </form>
  );
};

export default WikiDocumentForm;