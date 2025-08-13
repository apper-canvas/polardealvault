import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import IssueCard from '@/components/molecules/IssueCard';
import IssueForm from '@/components/molecules/IssueForm';
import KanbanBoard from '@/components/molecules/KanbanBoard';
import Pagination from '@/components/atoms/Pagination';
import issueService, { issueTypes, priorityLevels, statusWorkflow, environments } from '@/services/api/issueService';
import projectService from '@/services/api/projectService';
import { toast } from 'react-toastify';

const Issues = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Filters
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    environment: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, searchQuery, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesData, projectsData] = await Promise.all([
        issueService.getAll(),
        projectService.getAll()
      ]);
      
      setIssues(issuesData);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      setError('Failed to load issues');
      console.error('Error loading issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = issueService.searchIssues(searchQuery, filters);
    setFilteredIssues(filtered);
    setCurrentPage(1);
  };

  const handleCreateIssue = async (issueData) => {
    try {
      const newIssue = await issueService.create(issueData);
      setIssues(prev => [newIssue, ...prev]);
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateIssue = async (id, updateData) => {
    try {
      const updatedIssue = await issueService.update(id, updateData);
      setIssues(prev => prev.map(issue => 
        issue.Id === id ? updatedIssue : issue
      ));
      return updatedIssue;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      await issueService.remove(id);
      setIssues(prev => prev.filter(issue => issue.Id !== id));
      toast.success('Issue deleted successfully');
    } catch (error) {
      toast.error('Failed to delete issue');
      console.error('Error deleting issue:', error);
    }
  };

  const handleIssueClick = (issue) => {
    navigate(`/issues/${issue.Id}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      priority: 'all',
      assignee: 'all',
      environment: 'all'
    });
    setSearchQuery('');
  };

  // Get unique assignees for filter
  const getUniqueAssignees = () => {
    const assignees = [...new Set(issues.map(issue => issue.assignee).filter(Boolean))];
    return assignees.sort();
  };

  // Pagination for list view
  const paginatedIssues = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIssues.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIssues, currentPage, itemsPerPage]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage bugs, tasks, and feature requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="Columns" size={16} className="inline mr-1" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="List" size={16} className="inline mr-1" />
              List
            </button>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search issues by title, description, or tags..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="sm:w-auto"
            >
              <ApperIcon name="X" size={16} className="mr-2" />
              Clear
            </Button>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {issueTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statusWorkflow.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                {priorityLevels.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Assignees</option>
                {getUniqueAssignees().map(assignee => (
                  <option key={assignee} value={assignee}>
                    {assignee.split('@')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Environment Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Environment</label>
              <select
                value={filters.environment}
                onChange={(e) => handleFilterChange('environment', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Environments</option>
                {environments.map(env => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
            <span>
              Showing {filteredIssues.length} of {issues.length} issues
            </span>
            {(Object.values(filters).some(f => f !== 'all') || searchQuery) && (
              <span className="text-blue-600">Filters applied</span>
            )}
          </div>
        </div>
      </Card>

      {/* Issues Display */}
      {filteredIssues.length === 0 ? (
        <Empty
          title="No issues found"
          description={
            Object.values(filters).some(f => f !== 'all') || searchQuery
              ? "Try adjusting your search criteria or filters"
              : "Create your first issue to get started"
          }
          action={
            <Button onClick={() => setShowForm(true)}>
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Issue
            </Button>
          }
        />
      ) : viewMode === 'kanban' ? (
        <div className="min-h-[600px]">
          <KanbanBoard
            issues={filteredIssues}
            onUpdateIssue={handleUpdateIssue}
            onIssueClick={handleIssueClick}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{paginatedIssues.map((issue) => (
              <div key={issue.Id} className="cursor-pointer" onClick={() => handleIssueClick(issue)}>
                <IssueCard issue={issue} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredIssues.length > itemsPerPage && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredIssues.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Issue Form Modal */}
      <IssueForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateIssue}
        projects={projects}
      />
    </div>
  );
};

export default Issues;