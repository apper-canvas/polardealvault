import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { create as createIssue, getAll as getAllIssues, update as updateIssue } from "@/services/api/issueService";
import timeEntryService from "@/services/api/timeEntryService";
import projectService from "@/services/api/projectService";
import { create as createTeamMember, createTeamMember as createTeamMemberDirect, getAll as getAllTeamMembers, getAllTeamMembers as getAllTeamMembersDirect, search as searchTeamMembers, update as updateTeamMember, updateTeamMember as updateTeamMemberDirect } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TimeEntryCard from "@/components/molecules/TimeEntryCard";
import TimeEntryForm from "@/components/molecules/TimeEntryForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Projects from "@/components/pages/Projects";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // all, today, week, month
  const [userFilter, setUserFilter] = useState("all"); // all, my, team
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, project, duration
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // create, edit
  const [viewMode, setViewMode] = useState("grid"); // grid, list, calendar
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [projectFilter, setProjectFilter] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [entriesData, projectsData] = await Promise.all([
        timeEntryService.getAll(),
        projectService.getAll()
      ]);
      setTimeEntries(entriesData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
};

  // Helper function to find project by ID
  const getProjectById = (projectId) => {
    return projects.find(project => project.Id === parseInt(projectId));
  };

useEffect(() => {
    loadData();
  }, []);
  // Filter and search logic
const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...timeEntries];
    const currentUserId = 1; // In a real app, this would come from auth context

    // Apply user filter (My vs Team entries)
    switch (userFilter) {
      case "my":
        // Filter to show only current user's entries
        // For demo purposes, assume entries with Id 1, 3, 6, 10 belong to current user
        filtered = filtered.filter(entry => [1, 3, 6, 10].includes(entry.Id));
        break;
      case "team":
        // Filter to show only team members' entries (excluding current user)
        filtered = filtered.filter(entry => ![1, 3, 6, 10].includes(entry.Id));
        break;
      // "all" case shows everything, so no filtering needed
    }

    // Apply time filter
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filter) {
      case "today":
        filtered = filtered.filter(entry => entry.date === todayStr);
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart;
        });
        break;
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= monthStart;
        });
        break;
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(entry => entry.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(entry => entry.date <= dateRange.end);
    }

    // Apply project filter
    if (projectFilter) {
      filtered = filtered.filter(entry => entry.projectId === parseInt(projectFilter));
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.description.toLowerCase().includes(search) ||
        getProjectById(entry.projectId)?.name.toLowerCase().includes(search)
      );
    }

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "project":
          const projectA = getProjectById(a.projectId)?.name || "";
          const projectB = getProjectById(b.projectId)?.name || "";
          comparison = projectA.localeCompare(projectB);
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [timeEntries, filter, userFilter, searchTerm, sortBy, sortOrder, dateRange, projectFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalHours = filteredAndSortedEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalEntries = filteredAndSortedEntries.length;
    const projectBreakdown = {};
    
    filteredAndSortedEntries.forEach(entry => {
      const project = getProjectById(entry.projectId);
      const projectName = project?.name || "Unknown";
      projectBreakdown[projectName] = (projectBreakdown[projectName] || 0) + entry.duration;
    });

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalEntries,
      averageHours: totalEntries > 0 ? Math.round((totalHours / totalEntries) * 100) / 100 : 0,
      projectBreakdown
    };
  }, [filteredAndSortedEntries]);


  const handleCreateEntry = async (entryData) => {
    try {
      setLoading(true);
      await timeEntryService.create(entryData);
      toast.success("Time entry created successfully");
      loadData();
      closeModal();
    } catch (error) {
      console.error("Error creating time entry:", error);
      toast.error("Failed to create time entry");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = async (entryData) => {
    try {
      setLoading(true);
      await timeEntryService.update(selectedEntry.Id, entryData);
      toast.success("Time entry updated successfully");
      loadData();
      closeModal();
    } catch (error) {
      console.error("Error updating time entry:", error);
      toast.error("Failed to update time entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this time entry?")) {
      return;
    }

    try {
      setLoading(true);
      await timeEntryService.delete(entryId);
      toast.success("Time entry deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    } finally {
      setLoading(false);
    }
};

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) return;
    
    if (window.confirm(`Delete ${selectedEntries.length} time entries?`)) {
      try {
        setLoading(true);
        await timeEntryService.bulkDelete(selectedEntries);
        await loadData();
        setSelectedEntries([]);
        setShowBulkActions(false);
        toast.success(`${selectedEntries.length} time entries deleted successfully`);
      } catch (error) {
        console.error("Failed to delete time entries:", error);
        toast.error("Failed to delete time entries");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkExport = async () => {
    try {
      setIsExporting(true);
      const data = selectedEntries.length > 0 
        ? selectedEntries.map(id => filteredAndSortedEntries.find(e => e.Id === id))
        : filteredAndSortedEntries;
      
      await timeEntryService.exportToCSV(data, projects);
      toast.success("Time entries exported successfully");
    } catch (error) {
      console.error("Failed to export time entries:", error);
      toast.error("Failed to export time entries");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === filteredAndSortedEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredAndSortedEntries.map(entry => entry.Id));
    }
  };

  const toggleEntrySelection = (entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const renderCalendarView = () => {
    const calendarEntries = filteredAndSortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === calendarDate.getMonth() && 
             entryDate.getFullYear() === calendarDate.getFullYear();
    });

    const groupedByDate = calendarEntries.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});

    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCalendarDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-white p-2 min-h-24" />
          ))}
          {days.map(day => {
            const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEntries = groupedByDate[dateStr] || [];
            const totalHours = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);

            return (
              <div key={day} className="bg-white p-2 min-h-24 border-r border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
{dayEntries.length > 0 && (
                  <div className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md mb-2 text-center shadow-sm">
                    {totalHours.toFixed(1)}h tracked
                  </div>
                )}
                <div className="space-y-1">
                  {dayEntries.slice(0, 2).map(entry => {
                    const project = getProjectById(entry.projectId);
                    return (
                      <div
                        key={entry.Id}
                        className="text-xs p-1 rounded bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                        onClick={() => openEditModal(entry)}
title={`${project?.name || 'Unknown Project'} - ${entry.duration}h\n${entry.description || 'No description'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate text-xs font-medium">{project?.name || 'Unknown'}</span>
                          <span className="text-xs font-bold ml-1">{entry.duration}h</span>
                        </div>
                        {entry.description && (
                          <div className="text-xs text-blue-600 truncate mt-0.5 opacity-75">
                            {entry.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dayEntries.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEntries.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const openCreateModal = () => {
    setSelectedEntry(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    setModalMode("create");
  };
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header with Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Track and manage your time across projects</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{summaryStats.totalHours}h</div>
              <div className="text-gray-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{summaryStats.totalEntries}</div>
              <div className="text-gray-500">Entries</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{summaryStats.averageHours}h</div>
              <div className="text-gray-500">Average</div>
            </div>
          </div>
          <Button
            onClick={openCreateModal}
            variant="primary"
            className="whitespace-nowrap"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Log Time
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* User Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            {[
              { value: "all", label: "All Timesheets" },
              { value: "my", label: "My Timesheet" },
              { value: "team", label: "Team's Timesheet" }
            ].map((option) => (
              <Button
                key={option.value}
                variant={userFilter === option.value ? "primary" : "secondary"}
                size="sm"
                onClick={() => setUserFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Time Period Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            {["all", "today", "week", "month"].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(filterOption)}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <div className="relative">
              <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search time entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex rounded-lg border border-gray-200 p-1">
              {[
                { mode: "grid", icon: "Grid3X3" },
                { mode: "list", icon: "List" },
                { mode: "calendar", icon: "Calendar" }
              ].map(({ mode, icon }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="p-2"
                >
                  <ApperIcon name={icon} size={16} />
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <ApperIcon name="Filter" size={16} className="mr-2" />
            Filters
          </Button>

          {/* Export */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkExport}
            disabled={isExporting}
          >
            <ApperIcon name={isExporting ? "Loader2" : "Download"} size={16} className="mr-2" />
            Export
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.Id} value={project.Id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedEntries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedEntries.length} entries selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkExport}
                disabled={isExporting}
              >
                <ApperIcon name="Download" size={16} className="mr-2" />
                Export Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <ApperIcon name="Trash2" size={16} className="mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="project">Project</option>
                <option value="duration">Duration</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <ApperIcon name={sortOrder === "asc" ? "ArrowUp" : "ArrowDown"} size={16} />
              </Button>
            </div>
          </div>
          
          {viewMode !== "calendar" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              <ApperIcon name="CheckSquare" size={16} className="mr-2" />
              {selectedEntries.length === filteredAndSortedEntries.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "calendar" ? renderCalendarView() : (
        <>
          {filteredAndSortedEntries.length === 0 ? (
            <Empty
              title="No time entries found"
              description={
                filter !== "all" || searchTerm || projectFilter
                  ? "No time entries match your current filters. Try adjusting your search criteria."
                  : "You haven't logged any time yet. Click 'Log Time' to create your first entry."
              }
              action={
                <Button onClick={openCreateModal} variant="primary">
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Log Time
                </Button>
              }
            />
          ) : (
            <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
              {filteredAndSortedEntries.map((timeEntry) => (
                <div key={timeEntry.Id} className="relative">
                  {viewMode !== "calendar" && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(timeEntry.Id)}
                        onChange={() => toggleEntrySelection(timeEntry.Id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <TimeEntryCard
                    key={timeEntry.Id}
                    timeEntry={timeEntry}
                    project={getProjectById(timeEntry.projectId)}
                    onEdit={() => openEditModal(timeEntry)}
                    onDelete={() => handleDeleteEntry(timeEntry.Id)}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === "create" ? "Log Time" : "Edit Time Entry"}>
        <TimeEntryForm
          timeEntry={selectedEntry}
          projects={projects}
          onSubmit={modalMode === "create" ? handleCreateEntry : handleEditEntry}
          onCancel={closeModal}
        />
      </Modal>
    </div>
);
};

export default TimeTracking;