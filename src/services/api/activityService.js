import { create as createIssue, getAll as getAllIssues } from "@/services/api/issueService";
import { create as createTeamMember, getAll as getAllTeamMembers } from "@/services/api/teamMemberService";
// Mock activity service with comprehensive tracking
const activities = [];
let nextId = 1;

const ACTIVITY_TYPES = {
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated", 
  TASK_COMPLETED: "task_completed",
  TASK_DELETED: "task_deleted",
  COMMENT_CREATED: "comment_created",
  COMMENT_UPDATED: "comment_updated",
  COMMENT_DELETED: "comment_deleted",
  FILE_UPLOADED: "file_uploaded",
  FILE_DELETED: "file_deleted",
  MILESTONE_CREATED: "milestone_created",
  MILESTONE_COMPLETED: "milestone_completed",
  PROJECT_CREATED: "project_created",
  PROJECT_UPDATED: "project_updated",
  TEAM_MEMBER_ADDED: "team_member_added",
  USER_MENTIONED: "user_mentioned",
  CHAT_MESSAGE: "chat_message",
  TASK_ASSIGNED: "task_assigned"
};

// Initialize with sample activities
// Initialize with sample activities
const initializeActivities = () => {
  if (activities.length === 0) {
    const sampleActivities = [
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.TASK_CREATED,
        title: "New task created: 'Implement user authentication'",
        description: "Created high priority task for development team - click to view project",
        userId: 1,
        projectId: 1,
        taskId: 15,
        targetType: 'project',
        targetId: 1,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
        isRead: false
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.COMMENT_CREATED,
        title: "Sarah Wilson commented on 'Database Migration'",
        description: "Added clarification about migration process and timeline - click to view project",
        userId: 2,
        projectId: 2,
        taskId: 8,
        targetType: 'project',
        targetId: 2,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
        isRead: false
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.TASK_COMPLETED,
        title: "Task completed: 'API Documentation Update'",
        description: "Documentation has been updated with latest endpoint changes - click to view project",
        userId: 3,
        projectId: 1,
        taskId: 12,
        targetType: 'project',
        targetId: 1,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        isRead: false
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.FILE_UPLOADED,
        title: "New file uploaded: 'design-mockups-v2.fig'",
        description: "Updated mockups with latest design revisions - click to view project",
        userId: 4,
        projectId: 3,
        fileName: "design-mockups-v2.fig",
        targetType: 'project',
        targetId: 3,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
        isRead: true
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.TASK_ASSIGNED,
        title: "Task assigned: 'Mobile responsive testing'",
        description: "Assigned to QA team for comprehensive testing across devices - click to view project",
        userId: 1,
        assignedToUserId: 5,
        projectId: 2,
        taskId: 20,
        targetType: 'project',
        targetId: 2,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        isRead: true
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.USER_MENTIONED,
        title: "You were mentioned in 'Frontend Review'",
        description: "Please review the latest frontend changes and provide feedback - click to view project",
        userId: 2,
        mentionedUserId: 1,
        projectId: 1,
        taskId: 18,
        targetType: 'project',
        targetId: 1,
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
        isRead: false
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.MILESTONE_COMPLETED,
        title: "Milestone completed: 'Phase 1 Development'",
        description: "All tasks in Phase 1 have been successfully completed - click to view project",
        userId: 1,
        projectId: 2,
        milestoneId: 3,
        targetType: 'project',
        targetId: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: true
      },
      {
        Id: nextId++,
        type: ACTIVITY_TYPES.CHAT_MESSAGE,
        title: "New message in 'Development Team' channel",
        description: "Discussion about upcoming sprint planning meeting",
        userId: 3,
        channelId: 1,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        isRead: true
      }
    ];
    
activities.push(...sampleActivities);
  }
};

const activityService = {
  getAll: () => {
    initializeActivities();
    return [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getByProjectId: (projectId) => {
    initializeActivities();
    return activities
      .filter(activity => activity.projectId === parseInt(projectId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getByTeamMember: (memberId) => {
    initializeActivities();
    return activities
      .filter(activity => activity.userId === parseInt(memberId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  create: (activityData) => {
    initializeActivities();
    const activity = {
      Id: nextId++,
      ...activityData,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    activities.push(activity);
    return activity;
  },

  getActivityCounts: () => {
    initializeActivities();
    const total = activities.length;
    const unread = activities.filter(activity => !activity.isRead).length;
    return { total, unread };
  },

  getRecentActivities: (limit = 50) => {
    initializeActivities();
    return [...activities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  markAsRead: (activityId) => {
    initializeActivities();
    const activity = activities.find(a => a.Id === parseInt(activityId));
    if (activity) {
      activity.isRead = true;
    }
    return activity;
  },

  markAllAsRead: () => {
    initializeActivities();
    activities.forEach(activity => {
      activity.isRead = true;
    });
    return true;
  },

  clearAll: () => {
    activities.length = 0;
    return true;
  },

  // Track specific activity types
  trackTaskCreated: (taskData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.TASK_CREATED,
      title: `New task created: '${taskData.name}'`,
      description: taskData.description || `Priority: ${taskData.priority || 'Normal'}`,
      userId: taskData.createdBy || 1,
      projectId: taskData.projectId,
      taskId: taskData.Id
    });
  },

  trackTaskCompleted: (taskData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.TASK_COMPLETED,
      title: `Task completed: '${taskData.name}'`,
      description: taskData.description || 'Task has been marked as completed',
      userId: taskData.completedBy || 1,
      projectId: taskData.projectId,
      taskId: taskData.Id
    });
  },

  trackTaskAssigned: (taskData, assignedToUserId) => {
    return activityService.create({
      type: ACTIVITY_TYPES.TASK_ASSIGNED,
      title: `Task assigned: '${taskData.name}'`,
      description: `Assigned to team member`,
      userId: taskData.assignedBy || 1,
      assignedToUserId: assignedToUserId,
      projectId: taskData.projectId,
      taskId: taskData.Id
    });
  },

  trackCommentCreated: (commentData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.COMMENT_CREATED,
      title: `New comment on '${commentData.taskName || 'task'}'`,
      description: commentData.content?.substring(0, 100) + (commentData.content?.length > 100 ? '...' : ''),
      userId: commentData.userId,
      projectId: commentData.projectId,
      taskId: commentData.taskId,
      commentId: commentData.Id
    });
  },

  trackFileUploaded: (fileData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.FILE_UPLOADED,
      title: `New file uploaded: '${fileData.name}'`,
      description: `File size: ${(fileData.size / 1024 / 1024).toFixed(2)} MB`,
      userId: fileData.uploadedBy || 1,
      projectId: fileData.projectId,
      fileName: fileData.name,
      fileId: fileData.Id
    });
  },

  trackUserMentioned: (mentionData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.USER_MENTIONED,
      title: `You were mentioned in '${mentionData.contextName}'`,
      description: mentionData.content?.substring(0, 100) + (mentionData.content?.length > 100 ? '...' : ''),
      userId: mentionData.mentionedBy,
      mentionedUserId: mentionData.mentionedUserId,
      projectId: mentionData.projectId,
      taskId: mentionData.taskId
    });
  },

  trackMilestoneCompleted: (milestoneData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.MILESTONE_COMPLETED,
      title: `Milestone completed: '${milestoneData.name}'`,
      description: milestoneData.description || 'Milestone has been successfully completed',
      userId: milestoneData.completedBy || 1,
      projectId: milestoneData.projectId,
      milestoneId: milestoneData.Id
    });
  },

  trackProjectCreated: (projectData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.PROJECT_CREATED,
      title: `New project created: '${projectData.name}'`,
      description: projectData.description || `Client: ${projectData.clientName || 'Unknown'}`,
      userId: projectData.createdBy || 1,
      projectId: projectData.Id
    });
  },

  trackTeamMemberAdded: (memberData, projectId) => {
    return activityService.create({
      type: ACTIVITY_TYPES.TEAM_MEMBER_ADDED,
      title: `New team member added: ${memberData.name}`,
      description: `Role: ${memberData.role || 'Team Member'}`,
      userId: memberData.addedBy || 1,
      teamMemberId: memberData.Id,
      projectId: projectId
    });
  },

  trackChatMessage: (messageData) => {
    return activityService.create({
      type: ACTIVITY_TYPES.CHAT_MESSAGE,
      title: `New message in '${messageData.channelName || 'channel'}'`,
      description: messageData.content?.substring(0, 100) + (messageData.content?.length > 100 ? '...' : ''),
      userId: messageData.userId,
      channelId: messageData.channelId,
      messageId: messageData.Id
    });
  },

  ACTIVITY_TYPES,

  getActivityTypeInfo: (type) => {
    const typeMap = {
      [ACTIVITY_TYPES.TASK_CREATED]: {
        label: "Task Created",
        icon: "Plus",
        bgColor: "bg-green-100",
        textColor: "text-green-700"
      },
      [ACTIVITY_TYPES.TASK_UPDATED]: {
        label: "Task Updated", 
        icon: "Edit",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700"
      },
      [ACTIVITY_TYPES.TASK_COMPLETED]: {
        label: "Task Completed",
        icon: "CheckCircle",
        bgColor: "bg-green-100", 
        textColor: "text-green-700"
      },
      [ACTIVITY_TYPES.TASK_ASSIGNED]: {
        label: "Task Assigned",
        icon: "UserPlus",
        bgColor: "bg-purple-100",
        textColor: "text-purple-700"
      },
      [ACTIVITY_TYPES.COMMENT_CREATED]: {
        label: "New Comment",
        icon: "MessageCircle",
        bgColor: "bg-orange-100",
        textColor: "text-orange-700"
      },
      [ACTIVITY_TYPES.FILE_UPLOADED]: {
        label: "File Uploaded",
        icon: "Upload",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700"
      },
      [ACTIVITY_TYPES.MILESTONE_CREATED]: {
        label: "Milestone Created",
        icon: "Flag",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700"
      },
      [ACTIVITY_TYPES.MILESTONE_COMPLETED]: {
        label: "Milestone Completed",
        icon: "Award",
        bgColor: "bg-green-100",
        textColor: "text-green-700"
      },
      [ACTIVITY_TYPES.PROJECT_CREATED]: {
        label: "Project Created",
        icon: "Briefcase",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700"
      },
      [ACTIVITY_TYPES.PROJECT_UPDATED]: {
        label: "Project Updated",
        icon: "Settings",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700"
      },
      [ACTIVITY_TYPES.TEAM_MEMBER_ADDED]: {
        label: "Team Member Added",
        icon: "Users",
        bgColor: "bg-teal-100",
        textColor: "text-teal-700"
      },
      [ACTIVITY_TYPES.USER_MENTIONED]: {
        label: "You were mentioned",
        icon: "AtSign",
        bgColor: "bg-red-100",
        textColor: "text-red-700"
      },
      [ACTIVITY_TYPES.CHAT_MESSAGE]: {
        label: "New Message",
        icon: "MessageSquare",
        bgColor: "bg-pink-100",
        textColor: "text-pink-700"
      }
    };

    return typeMap[type] || {
      label: "Activity",
      icon: "Activity",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700"
    };
  }
};

export default activityService;