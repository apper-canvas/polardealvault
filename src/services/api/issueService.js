import mockIssues from '@/services/mockData/issues.json';
import mockComments from '@/services/mockData/issueComments.json';

let issues = [...mockIssues];
let comments = [...mockComments];
let nextIssueId = Math.max(...mockIssues.map(issue => issue.Id)) + 1;
let nextCommentId = Math.max(...mockComments.map(comment => comment.Id)) + 1;

// Issue CRUD operations
export const getAll = () => {
  return [...issues];
};

export const getById = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format');
  }
  return issues.find(issue => issue.Id === numericId) || null;
};

export const create = (issueData) => {
  const newIssue = {
    ...issueData,
    Id: nextIssueId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: issueData.attachments || [],
    tags: issueData.tags || []
  };
  issues.push(newIssue);
  return newIssue;
};

export const update = (id, updateData) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format');
  }
  
  const index = issues.findIndex(issue => issue.Id === numericId);
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  issues[index] = {
    ...issues[index],
    ...updateData,
    Id: numericId,
    updatedAt: new Date().toISOString()
  };
  
  return issues[index];
};

export const remove = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format');
  }
  
  const index = issues.findIndex(issue => issue.Id === numericId);
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  issues.splice(index, 1);
  // Also remove associated comments
  comments = comments.filter(comment => comment.issueId !== numericId);
  return true;
};

// Comment operations
export const getCommentsByIssueId = (issueId) => {
  const numericId = parseInt(issueId);
  if (isNaN(numericId)) {
    throw new Error('Invalid issue ID format');
  }
  return comments.filter(comment => comment.issueId === numericId);
};

export const createComment = (commentData) => {
  const newComment = {
    ...commentData,
    Id: nextCommentId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mentions: extractMentions(commentData.content)
  };
  comments.push(newComment);
  return newComment;
};

export const updateComment = (id, updateData) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format');
  }
  
  const index = comments.findIndex(comment => comment.Id === numericId);
  if (index === -1) {
    throw new Error('Comment not found');
  }
  
  comments[index] = {
    ...comments[index],
    ...updateData,
    Id: numericId,
    updatedAt: new Date().toISOString(),
    mentions: extractMentions(updateData.content || comments[index].content)
  };
  
  return comments[index];
};

export const deleteComment = (id) => {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format');
  }
  
  const index = comments.findIndex(comment => comment.Id === numericId);
  if (index === -1) {
    throw new Error('Comment not found');
  }
  
  comments.splice(index, 1);
  return true;
};

// Search and filter operations
export const searchIssues = (query, filters = {}) => {
  let filteredIssues = [...issues];
  
  // Text search
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    filteredIssues = filteredIssues.filter(issue =>
      issue.title.toLowerCase().includes(searchTerm) ||
      issue.description.toLowerCase().includes(searchTerm) ||
      issue.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filter by type
  if (filters.type && filters.type !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.type === filters.type);
  }
  
  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.status === filters.status);
  }
  
  // Filter by priority
  if (filters.priority && filters.priority !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.priority === filters.priority);
  }
  
  // Filter by assignee
  if (filters.assignee && filters.assignee !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.assignee === filters.assignee);
  }
  
  // Filter by environment
  if (filters.environment && filters.environment !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.environment === filters.environment);
  }
  
  return filteredIssues;
};

// Utility functions
const extractMentions = (content) => {
  const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Issue types configuration
export const issueTypes = [
  {
    id: 'Bug',
    name: 'Bug',
    icon: 'Bug',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'Task',
    name: 'Task',
    icon: 'CheckSquare',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'Feature Request',
    name: 'Feature Request',
    icon: 'Lightbulb',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'Improvement',
    name: 'Improvement',
    icon: 'TrendingUp',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

// Priority levels
export const priorityLevels = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

// Status workflow
export const statusWorkflow = ['To Do', 'In Progress', 'In Review', 'Done'];

// Environment options
export const environments = ['Production', 'Staging', 'Development'];

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getCommentsByIssueId,
  createComment,
  updateComment,
  deleteComment,
  searchIssues,
  issueTypes,
  priorityLevels,
  statusWorkflow,
  environments
};