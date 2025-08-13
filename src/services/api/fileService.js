import fileAttachmentsData from '@/services/mockData/fileAttachments.json';

let fileAttachments = [...fileAttachmentsData];

const fileService = {
  // Get all files for a specific task or project
  getByTaskId: (taskId) => {
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Valid task ID is required');
    }
    return Promise.resolve(
      fileAttachments
        .filter(file => file.taskId === taskId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );
  },

  getByProjectId: (projectId) => {
    if (!projectId || typeof projectId !== 'number') {
      throw new Error('Valid project ID is required');
    }
    return Promise.resolve(
      fileAttachments
        .filter(file => file.projectId === projectId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );
  },

  getByCommentId: (commentId) => {
    if (!commentId || typeof commentId !== 'number') {
      throw new Error('Valid comment ID is required');
    }
    return Promise.resolve(
      fileAttachments
        .filter(file => file.commentId === commentId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );
  },

  // Get all files
  getAll: () => {
    return Promise.resolve([...fileAttachments]);
  },

  // Get a specific file by ID
  getById: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid file ID is required');
    }
    const file = fileAttachments.find(f => f.Id === id);
    if (!file) {
      throw new Error('File not found');
    }
    return Promise.resolve({ ...file });
  },

  // Upload a new file
  upload: (fileData) => {
    if (!fileData || typeof fileData !== 'object') {
      throw new Error('Valid file data is required');
    }

    const { taskId, projectId, commentId, file, uploadedBy } = fileData;

    if (!uploadedBy || typeof uploadedBy !== 'number') {
      throw new Error('Uploader ID is required');
    }
    if (!file || !file.name) {
      throw new Error('File object is required');
    }
    if (!taskId && !projectId) {
      throw new Error('Either task ID or project ID is required');
    }

    // Check for existing file with same name for versioning
    const existingFiles = fileAttachments.filter(f => 
      f.fileName === file.name && 
      ((taskId && f.taskId === taskId) || (projectId && f.projectId === projectId))
    );

    const version = existingFiles.length > 0 ? Math.max(...existingFiles.map(f => f.version)) + 1 : 1;

    // Mark previous versions as not latest
    if (existingFiles.length > 0) {
      existingFiles.forEach(f => {
        const index = fileAttachments.findIndex(file => file.Id === f.Id);
        if (index !== -1) {
          fileAttachments[index].isLatest = false;
        }
      });
    }

    // Generate mock URLs (in real app, these would be actual storage URLs)
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const baseFileName = fileName.replace(/\.[^/.]+$/, '');
    
    const newFile = {
      Id: Math.max(...fileAttachments.map(f => f.Id), 0) + 1,
      taskId: taskId || null,
      projectId: projectId || null,
      commentId: commentId || null,
      fileName,
      fileSize: file.size || 0,
      fileType: file.type || 'application/octet-stream',
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      version,
      isLatest: true,
      url: `/uploads/${baseFileName}-v${version}.${fileExtension}`,
      previewUrl: this.canPreview(file.type) ? `/previews/${baseFileName}-v${version}.jpg` : null
    };

    fileAttachments.push(newFile);
    return Promise.resolve({ ...newFile });
  },

  // Delete a file
  delete: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid file ID is required');
    }

    const fileIndex = fileAttachments.findIndex(f => f.Id === id);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }

    fileAttachments.splice(fileIndex, 1);
    return Promise.resolve({ success: true });
  },

  // Get file versions
  getVersions: (fileName, taskId = null, projectId = null) => {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Valid file name is required');
    }

    const versions = fileAttachments
      .filter(f => 
        f.fileName === fileName && 
        ((taskId && f.taskId === taskId) || (projectId && f.projectId === projectId))
      )
      .sort((a, b) => b.version - a.version);

    return Promise.resolve(versions.map(v => ({ ...v })));
  },

  // Check if file type can be previewed
  canPreview: (fileType) => {
    const previewableTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown'
    ];
    return previewableTypes.includes(fileType);
  },

  // Get file type icon
  getFileIcon: (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (fileType.includes('document') || fileType.includes('word')) return 'FileText';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'FileSpreadsheet';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return 'Archive';
    if (fileType.includes('video')) return 'Video';
    if (fileType.includes('audio')) return 'Music';
    return 'File';
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
};

// Import activity service to track file activities
import activityService from './activityService.js';

// Override upload method to track activity
const originalUpload = fileService.upload;
fileService.upload = async (fileData) => {
  const newFile = await originalUpload(fileData);
  
  // Track file upload activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.FILE_UPLOADED,
    userId: newFile.uploadedBy,
    projectId: newFile.projectId,
    taskId: newFile.taskId,
    fileId: newFile.Id,
    description: `uploaded file "${newFile.fileName}"${newFile.taskId ? ' to a task' : ''}${newFile.projectId ? ' in project' : ''}`
  });
  
  return newFile;
};

// Override delete method to track activity
const originalFileDelete = fileService.delete;
fileService.delete = async (id) => {
  const file = await fileService.getById(id);
  await originalFileDelete(id);
  
  // Track file deletion activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.FILE_DELETED,
    userId: file.uploadedBy,
    projectId: file.projectId,
    taskId: file.taskId,
    fileId: file.Id,
    description: `deleted file "${file.fileName}"${file.taskId ? ' from a task' : ''}${file.projectId ? ' in project' : ''}`
  });
};

export default fileService;