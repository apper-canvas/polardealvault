import commentsData from "@/services/mockData/comments.json";
import activityService from "./activityService.js";
// Note: React import removed as not needed in service file
// teamMemberService import removed as not used in this service
// Removed improper React component import - services should use native Error objects

let comments = [...commentsData];

const commentService = {
  // Get all comments for a specific task or project
  getByTaskId: (taskId) => {
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Valid task ID is required');
    }
    return Promise.resolve(
      comments
        .filter(comment => comment.taskId === taskId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    );
  },


  // Get all comments (for admin/moderation purposes)
  getAll: () => {
    return Promise.resolve([...comments]);
  },

  // Get a specific comment by ID
  getById: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid comment ID is required');
    }
    const comment = comments.find(c => c.Id === id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return Promise.resolve({ ...comment });
  },

  // Create a new comment
  create: (commentData) => {
    if (!commentData || typeof commentData !== 'object') {
      throw new Error('Valid comment data is required');
    }

const { taskId, authorId, content, parentId } = commentData;

    if (!authorId || typeof authorId !== 'number') {
      throw new Error('Author ID is required');
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Task ID is required');
    }

    // Extract mentions from content
    const mentions = [];
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      // In a real app, you'd resolve usernames to user IDs
      // For mock data, we'll use placeholder logic
      const username = match[1];
      if (username === 'john.doe') mentions.push(1);
      else if (username === 'sarah.wilson') mentions.push(2);
      else if (username === 'mike.chen') mentions.push(3);
    }

    const newComment = {
Id: Math.max(...comments.map(c => c.Id), 0) + 1,
      taskId,
      authorId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: parentId || null,
      mentions: [...new Set(mentions)], // Remove duplicates
      isEdited: false
    };

    comments.push(newComment);
    return Promise.resolve({ ...newComment });
  },

  // Update an existing comment
  update: (id, updateData) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid comment ID is required');
    }
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Valid update data is required');
    }

    const commentIndex = comments.findIndex(c => c.Id === id);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const existingComment = comments[commentIndex];
    const { content } = updateData;

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Comment content must be a non-empty string');
      }

      // Extract mentions from updated content
      const mentions = [];
      const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        const username = match[1];
        if (username === 'john.doe') mentions.push(1);
        else if (username === 'sarah.wilson') mentions.push(2);
        else if (username === 'mike.chen') mentions.push(3);
      }

      comments[commentIndex] = {
        ...existingComment,
        content: content.trim(),
        updatedAt: new Date().toISOString(),
        mentions: [...new Set(mentions)],
        isEdited: true
      };
    }

    return Promise.resolve({ ...comments[commentIndex] });
  },

  // Delete a comment
  delete: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid comment ID is required');
    }

    const commentIndex = comments.findIndex(c => c.Id === id);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    // Also delete all replies to this comment
    const commentToDelete = comments[commentIndex];
    comments = comments.filter(c => c.Id !== id && c.parentId !== id);

    return Promise.resolve({ success: true });
  },

  // Get comment thread (parent + all replies)
  getThread: (parentId) => {
    if (!parentId || typeof parentId !== 'number') {
      throw new Error('Valid parent comment ID is required');
    }

    const parentComment = comments.find(c => c.Id === parentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    const replies = comments
      .filter(c => c.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

return Promise.resolve({
      parent: { ...parentComment },
      replies: replies.map(r => ({ ...r }))
    });
  }
};
// Import activity service to track comment activities

// Override create method to track activity
const originalCreate = commentService.create;
commentService.create = async (commentData) => {
  const newComment = await originalCreate(commentData);
  
  // Track comment creation activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.COMMENT_CREATED,
    userId: newComment.authorId,
    taskId: newComment.taskId,
    commentId: newComment.Id,
    description: 'added a comment to a task'
  });
  
  return newComment;
};

// Override update method to track activity
const originalCommentUpdate = commentService.update;
commentService.update = async (id, updateData) => {
  const updatedComment = await originalCommentUpdate(id, updateData);
  
  // Track comment update activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.COMMENT_UPDATED,
    userId: updatedComment.authorId,
    taskId: updatedComment.taskId,
    commentId: updatedComment.Id,
    description: 'updated a comment on a task'
  });
  
  return updatedComment;
};

// Override delete method to track activity
const originalCommentDelete = commentService.delete;
commentService.delete = async (id) => {
  const comment = await commentService.getById(id);
  await originalCommentDelete(id);
  
  // Track comment deletion activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.COMMENT_DELETED,
    userId: comment.authorId,
    taskId: comment.taskId,
    commentId: comment.Id,
    description: 'deleted a comment from a task'
  });
};

export default commentService;