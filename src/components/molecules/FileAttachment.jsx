import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import fileService from '@/services/api/fileService';

const FileAttachment = ({ file, onDelete, teamMembers = [] }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const getUploader = (uploaderId) => {
    return teamMembers.find(member => member.Id === uploaderId) || {
      name: 'Unknown User',
      email: 'unknown@example.com'
    };
  };

  const getFileIcon = (fileType) => {
    return fileService.getFileIcon(fileType);
  };

  const formatFileSize = (bytes) => {
    return fileService.formatFileSize(bytes);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const canPreview = (fileType) => {
    return fileService.canPreview(fileType);
  };

  const handlePreview = () => {
    if (canPreview(file.fileType)) {
      setShowPreview(true);
    } else {
      // For non-previewable files, trigger download
      window.open(file.url, '_blank');
    }
  };

  const handleVersionsClick = async () => {
    if (versions.length === 0) {
      setLoadingVersions(true);
      try {
        const fileVersions = await fileService.getVersions(
          file.fileName,
          file.taskId,
          file.projectId
        );
        setVersions(fileVersions);
      } catch (error) {
        console.error('Failed to load file versions:', error);
      } finally {
        setLoadingVersions(false);
      }
    }
    setShowVersions(true);
  };

  const uploader = getUploader(file.uploadedBy);
  const icon = getFileIcon(file.fileType);
  const isImage = file.fileType.startsWith('image/');

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start space-x-3">
          {/* File Icon or Preview */}
          <div className="flex-shrink-0">
            {isImage && file.previewUrl ? (
              <img
                src={file.previewUrl}
                alt={file.fileName}
                className="w-10 h-10 rounded object-cover cursor-pointer"
                onClick={handlePreview}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <ApperIcon name={icon} size={20} className="text-gray-500" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h6 
                className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                onClick={handlePreview}
                title={file.fileName}
              >
                {file.fileName}
              </h6>
              <div className="flex items-center space-x-1 ml-2">
                {canPreview(file.fileType) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreview}
                    className="p-1"
                    title="Preview"
                  >
                    <ApperIcon name="Eye" size={14} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  className="p-1"
                  title="Download"
                >
                  <ApperIcon name="Download" size={14} />
                </Button>
                {file.version > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVersionsClick}
                    className="p-1"
                    title="View versions"
                  >
                    <ApperIcon name="History" size={14} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(file.Id)}
                  className="p-1 text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <ApperIcon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatFileSize(file.fileSize)}</span>
                {file.version > 1 && (
                  <>
                    <span>•</span>
                    <span>v{file.version}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                by {uploader.name}
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(file.uploadedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={file.fileName}
        className="max-w-4xl"
      >
        <div className="p-4">
          {isImage ? (
            <img
              src={file.url}
              alt={file.fileName}
              className="max-w-full h-auto rounded"
            />
          ) : file.fileType === 'application/pdf' ? (
            <iframe
              src={file.url}
              className="w-full h-96 border rounded"
              title={file.fileName}
            />
          ) : file.fileType.startsWith('text/') ? (
            <div className="bg-gray-50 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {/* In a real app, you'd load and display the text content */}
              <p className="text-gray-500 italic">Text file preview would be loaded here</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <ApperIcon name={icon} size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <Button
                variant="primary"
                onClick={() => window.open(file.url, '_blank')}
              >
                <ApperIcon name="Download" size={16} className="mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Versions Modal */}
      <Modal
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        title={`File Versions - ${file.fileName}`}
        className="max-w-2xl"
      >
        <div className="p-4">
          {loadingVersions ? (
            <div className="flex items-center justify-center py-8">
              <ApperIcon name="Loader2" size={20} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map(version => {
                const versionUploader = getUploader(version.uploadedBy);
                return (
                  <div
                    key={version.Id}
                    className={`border rounded-lg p-3 ${
                      version.isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ApperIcon name={getFileIcon(version.fileType)} size={16} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              Version {version.version}
                            </span>
                            {version.isLatest && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(version.fileSize)} • by {versionUploader.name} • {formatDate(version.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {canPreview(version.fileType) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowVersions(false);
                              setShowPreview(true);
                            }}
                          >
                            <ApperIcon name="Eye" size={14} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(version.url, '_blank')}
                        >
                          <ApperIcon name="Download" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default FileAttachment;