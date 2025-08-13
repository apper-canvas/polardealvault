import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import reportService from "@/services/api/reportService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Tasks from "@/components/pages/Tasks";
import Projects from "@/components/pages/Projects";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

export default function Reports() {
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ projects: [], teamMembers: [] });
  const [filters, setFilters] = useState({
    projectId: '',
    teamMemberId: '',
    startDate: '',
    endDate: ''
  });
  const [viewMode, setViewMode] = useState("chart"); // chart, list
// Report data states
  const [projectStatusData, setProjectStatusData] = useState(null);
  const [teamPerformanceData, setTeamPerformanceData] = useState(null);
  const [timeTrackingData, setTimeTrackingData] = useState(null);
const [resourceAllocationData, setResourceAllocationData] = useState(null);
  
  // Custom reports state
  const [customReports, setCustomReports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    type: 'projectStatus',
    dateRange: 'lastMonth',
    customDateStart: '',
    customDateEnd: '',
    filters: {
      projectIds: [],
      teamMemberIds: [],
      clientIds: []
    },
    visualization: 'chart'
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      loadReportsData();
    }
  }, [filters]);
  
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const options = await reportService.getFilterOptions();
      setFilterOptions(options);
      
      await loadReportsData();
    } catch (err) {
      setError('Failed to load reports data');
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadReportsData = async () => {
    try {
const [projectStatus, teamPerformance, timeTracking, resourceAllocation] = await Promise.all([
        reportService.getProjectStatusData(filters),
        reportService.getTeamPerformanceData(filters),
        reportService.getTimeTrackingData(filters),
        reportService.getResourceAllocationData(filters)
      ]);
      
      setProjectStatusData(projectStatus);
      setTeamPerformanceData(teamPerformance);
      setTimeTrackingData(timeTracking);
      setResourceAllocationData(resourceAllocation);
    } catch (err) {
      console.error('Error loading reports:', err);
      toast.error('Failed to refresh reports data');
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      projectId: '',
      teamMemberId: '',
      startDate: '',
      endDate: ''
    });
};

  // Load custom reports
  async function loadCustomReports() {
    try {
      const reports = await reportService.getCustomReports();
      setCustomReports(reports);
    } catch (error) {
      console.error('Error loading custom reports:', error);
      toast.error('Failed to load custom reports');
    }
  }

  // Handle create report form
  function handleCreateFormChange(field, value) {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
}

  function handleCreateFormFilterChange(filterType, value) {
    setCreateFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  }

  async function handleCreateReport() {
    try {
      setIsCreating(true);
      
      // Validate form
      if (!createFormData.name.trim()) {
        toast.error('Report name is required');
        return;
      }

      if (createFormData.dateRange === 'custom') {
        if (!createFormData.customDateStart || !createFormData.customDateEnd) {
          toast.error('Custom date range requires both start and end dates');
          return;
        }
      }

      // Create report
      const newReport = await reportService.createReport(createFormData);
      
      // Update local state
      setCustomReports(prev => [...prev, newReport]);
      
      // Reset form and close modal
      setCreateFormData({
        name: '',
        description: '',
        type: 'projectStatus',
        dateRange: 'lastMonth',
        customDateStart: '',
        customDateEnd: '',
        filters: {
          projectIds: [],
          teamMemberIds: [],
          clientIds: []
        },
        visualization: 'chart'
      });
      setShowCreateModal(false);
      
      toast.success('Report created successfully');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
    } finally {
      setIsCreating(false);
    }
  }
  // Chart configurations
  const getProjectStatusPieConfig = () => {
    if (!projectStatusData?.statusDistribution) return null;
    
    const statuses = Object.keys(projectStatusData.statusDistribution);
    const values = Object.values(projectStatusData.statusDistribution);
    
    return {
      series: values,
      options: {
        chart: { type: 'pie' },
        labels: statuses,
        colors: ['#4A90E2', '#4CAF50', '#F1C40F', '#C0392B', '#9E9E9E'],
        legend: { position: 'bottom' },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: { width: 320 },
            legend: { position: 'bottom' }
          }
        }]
      }
    };
  };
  
  const getProjectProgressBarConfig = () => {
    if (!projectStatusData?.projectProgress) return null;
    
    const data = projectStatusData.projectProgress;
    
    return {
      series: [{
        name: 'Progress %',
        data: data.map(p => p.progress)
      }],
      options: {
        chart: { type: 'bar' },
        xaxis: { categories: data.map(p => p.name) },
        yaxis: { max: 100 },
        colors: ['#4A90E2'],
        plotOptions: {
          bar: { horizontal: false, columnWidth: '55%' }
        }
      }
    };
  };
  
  const getTeamCompletionLineConfig = () => {
    if (!teamPerformanceData?.completionTrends) return null;
    
    const data = teamPerformanceData.completionTrends;
    
    return {
      series: [{
        name: 'Tasks Completed',
        data: data.map(d => ({ x: d.date, y: d.completed }))
      }],
      options: {
        chart: { type: 'line' },
        stroke: { curve: 'smooth' },
        colors: ['#4CAF50'],
        xaxis: { type: 'datetime' }
      }
    };
  };
  
  const getTeamTasksBarConfig = () => {
    if (!teamPerformanceData?.memberPerformance) return null;
    
    const data = teamPerformanceData.memberPerformance;
    
    return {
      series: [{
        name: 'Completed Tasks',
        data: data.map(m => m.completed)
      }, {
        name: 'Total Tasks',
        data: data.map(m => m.total)
      }],
      options: {
        chart: { type: 'bar' },
        xaxis: { categories: data.map(m => m.name) },
        colors: ['#4CAF50', '#4A90E2']
      }
    };
  };
  
  const getTimeTrackingStackedConfig = () => {
    if (!timeTrackingData?.timeByProject) return null;
    
    const data = timeTrackingData.timeByProject;
    if (data.length === 0) return null;
    
    // Get all unique team members
    const allMembers = new Set();
    data.forEach(project => {
      Object.keys(project).forEach(key => {
        if (key !== 'project') allMembers.add(key);
      });
    });
    
    const series = Array.from(allMembers).map(member => ({
      name: member,
      data: data.map(project => project[member] || 0)
    }));
    
    return {
      series,
      options: {
        chart: { type: 'bar', stacked: true },
        xaxis: { categories: data.map(p => p.project) },
        colors: ['#4A90E2', '#4CAF50', '#F1C40F', '#C0392B', '#9E9E9E']
      }
    };
  };
// Get resource allocation heat map configuration
  const getResourceAllocationHeatmapConfig = () => {
    if (!resourceAllocationData?.allocationMatrix) return null;
    
    const data = resourceAllocationData.allocationMatrix;
    const projects = resourceAllocationData.projects;
    const teamMembers = resourceAllocationData.teamMembers;
    
    // Create series data for heatmap
    const series = teamMembers.map((member, memberIndex) => ({
      name: member.name,
      data: projects.map((project, projectIndex) => {
        const allocation = data.find(d => d.memberId === member.Id && d.projectId === project.Id);
        return {
          x: project.name,
          y: allocation ? allocation.hoursAllocated : 0,
          fillColor: allocation ? (allocation.hoursAllocated > 0 ? '#4A90E2' : '#F3F4F6') : '#F3F4F6'
        };
      })
    }));
    
    return {
      series,
      options: {
        chart: { 
          type: 'heatmap',
          toolbar: { show: false }
        },
        colors: ['#4A90E2'],
        xaxis: {
          categories: projects.map(p => p.name)
        },
        yaxis: {
          categories: teamMembers.map(m => m.name)
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 0.5,
            colorScale: {
              ranges: [
                { from: 0, to: 0, color: '#F3F4F6', name: 'No allocation' },
                { from: 1, to: 20, color: '#10B981', name: 'Light load' },
                { from: 21, to: 35, color: '#F59E0B', name: 'Moderate load' },
                { from: 36, to: 50, color: '#EF4444', name: 'Heavy load' }
              ]
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['#fff']
          }
        },
        tooltip: {
          custom: function({ series, seriesIndex, dataPointIndex, w }) {
            const member = teamMembers[seriesIndex];
            const project = projects[dataPointIndex];
            const allocation = data.find(d => d.memberId === member.Id && d.projectId === project.Id);
            
            if (!allocation || allocation.hoursAllocated === 0) {
              return `<div class="p-2 bg-white border rounded shadow">
                <strong>${member.name}</strong><br/>
                <span>Not allocated to ${project.name}</span>
              </div>`;
            }
            
            return `<div class="p-2 bg-white border rounded shadow">
              <strong>${member.name}</strong><br/>
              <span>Project: ${project.name}</span><br/>
              <span>Hours: ${allocation.hoursAllocated}/week</span><br/>
              <span>Role: ${allocation.role}</span>
            </div>`;
          }
        }
      }
    };
  };
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your projects and team performance</p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("chart")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "chart" 
                  ? "text-white shadow-sm"
                  : "hover:text-gray-900"
              }`}
              style={viewMode === "chart" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
            >
              <ApperIcon name="BarChart3" size={16} className="mr-1" />
              Charts
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list" 
                  ? "text-white shadow-sm"
                  : "hover:text-gray-900"
              }`}
              style={viewMode === "list" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
            >
              <ApperIcon name="List" size={16} className="mr-1" />
              Tables
            </button>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Create New Report
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {filterOptions.projects.map(project => (
                <option key={project.Id} value={project.Id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <select
              value={filters.teamMemberId}
              onChange={(e) => handleFilterChange('teamMemberId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Team Members</option>
              {filterOptions.teamMembers.map(member => (
                <option key={member.Id} value={member.Id}>{member.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          
          <Button variant="outline" onClick={clearFilters}>
            <ApperIcon name="X" size={16} />
            Clear
          </Button>
        </div>
      </Card>
      
      {/* Project Status Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ApperIcon name="PieChart" size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Project Status Report</h2>
            <p className="text-gray-600">High-level overview of all projects</p>
          </div>
        </div>
        
{projectStatusData && (
          viewMode === "chart" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Status Distribution</h3>
                {getProjectStatusPieConfig() && (
                  <Chart
                    options={getProjectStatusPieConfig().options}
                    series={getProjectStatusPieConfig().series}
                    type="pie"
                    height={300}
                  />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Project Progress</h3>
                {getProjectProgressBarConfig() && (
                  <Chart
                    options={getProjectProgressBarConfig().options}
                    series={getProjectProgressBarConfig().series}
                    type="bar"
                    height={300}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Project Status Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Count</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(projectStatusData.statusDistribution || {}).map(([status, count]) => {
                        const total = Object.values(projectStatusData.statusDistribution).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return (
                          <tr key={status}>
                            <td className="border border-gray-300 px-4 py-2">{status}</td>
                            <td className="border border-gray-300 px-4 py-2">{count}</td>
                            <td className="border border-gray-300 px-4 py-2">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Project Progress Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Project Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Progress</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(projectStatusData.projectProgress || []).map((project) => (
                        <tr key={project.name}>
                          <td className="border border-gray-300 px-4 py-2">{project.name}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span>{project.progress}%</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{project.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </Card>
      
      {/* Team Performance Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ApperIcon name="TrendingUp" size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Performance Report</h2>
            <p className="text-gray-600">Team workloads and task completion rates</p>
          </div>
        </div>
        
        {teamPerformanceData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Task Completion Trends</h3>
              {getTeamCompletionLineConfig() && (
                <Chart
                  options={getTeamCompletionLineConfig().options}
                  series={getTeamCompletionLineConfig().series}
                  type="line"
                  height={300}
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Tasks by Team Member</h3>
              {getTeamTasksBarConfig() && (
                <Chart
                  options={getTeamTasksBarConfig().options}
                  series={getTeamTasksBarConfig().series}
                  type="bar"
                  height={300}
                />
              )}
            </div>
          </div>
        )}
      </Card>
{/* Resource Allocation Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ApperIcon name="Users" size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resource Allocation Report</h2>
            <p className="text-gray-600">Team member allocation across projects with capacity analysis</p>
          </div>
        </div>
        
        {resourceAllocationData && (
          <div className="space-y-6">
            {/* Allocation Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ApperIcon name="CheckCircle" size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Available</span>
                </div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {resourceAllocationData.summary.available}
                </div>
                <div className="text-xs text-green-700">Team members</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Clock" size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">At Capacity</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900 mt-1">
                  {resourceAllocationData.summary.atCapacity}
                </div>
                <div className="text-xs text-yellow-700">Team members</div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ApperIcon name="AlertTriangle" size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">Over-allocated</span>
                </div>
                <div className="text-2xl font-bold text-red-900 mt-1">
                  {resourceAllocationData.summary.overAllocated}
                </div>
                <div className="text-xs text-red-700">Team members</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Target" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Avg Utilization</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {resourceAllocationData.summary.avgUtilization}%
                </div>
                <div className="text-xs text-blue-700">Team capacity</div>
              </div>
            </div>
            
            {/* Project Allocation Heatmap */}
            <div>
              <h3 className="text-lg font-medium mb-3">Team Member Allocation by Project</h3>
              <div className="mb-4 text-sm text-gray-600">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span>No allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>1-20 hrs/week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>21-35 hrs/week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>36+ hrs/week</span>
                  </div>
                </div>
              </div>
              {getResourceAllocationHeatmapConfig() && (
                <Chart
                  options={getResourceAllocationHeatmapConfig().options}
                  series={getResourceAllocationHeatmapConfig().series}
                  type="heatmap"
                  height={300}
                />
              )}
            </div>
            
            {/* Detailed Allocation Table */}
            <div>
              <h3 className="text-lg font-medium mb-3">Detailed Allocation Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Team Member</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Current Load</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Capacity</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Utilization</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resourceAllocationData.teamMembers.map(member => {
                      const workloadPercentage = Math.round((member.currentWorkload / member.maxCapacity) * 100);
                      const statusColor = workloadPercentage <= 80 ? 'text-green-600' : 
                                        workloadPercentage <= 100 ? 'text-yellow-600' : 'text-red-600';
                      const statusText = workloadPercentage <= 80 ? 'Available' : 
                                       workloadPercentage <= 100 ? 'At Capacity' : 'Over-allocated';
                      
                      return (
                        <tr key={member.Id}>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <img 
                                src={member.avatar} 
                                alt={member.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-medium">{member.name}</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{member.currentWorkload}h</td>
                          <td className="border border-gray-300 px-4 py-2">{member.maxCapacity}h</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    workloadPercentage <= 80 ? 'bg-green-500' :
                                    workloadPercentage <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm">{workloadPercentage}%</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span className={`text-sm font-medium ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="space-y-1">
                              {member.currentProjects?.map(project => (
                                <div key={project.projectId} className="text-xs">
                                  <span className="font-medium">{project.projectName}</span>
                                  <span className="text-gray-500 ml-1">({project.hoursAllocated}h)</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* Time Tracking Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ApperIcon name="Clock" size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Time Tracking Report</h2>
            <p className="text-gray-600">Detailed report of all logged time</p>
          </div>
        </div>
        
        {timeTrackingData && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Hours by Team Member & Project</h3>
              <div className="text-sm text-gray-600">
                Total: {timeTrackingData.totalHours} hours ({timeTrackingData.totalEntries} entries)
              </div>
            </div>
            {getTimeTrackingStackedConfig() && (
              <Chart
                options={getTimeTrackingStackedConfig().options}
                series={getTimeTrackingStackedConfig().series}
                type="bar"
                height={400}
              />
            )}
          </div>
)}
      </Card>

      {/* Custom Reports Section */}
      {customReports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customReports.map((report) => (
              <Card key={report.Id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* TODO: Implement view report */}}
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* TODO: Implement edit report */}}
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="capitalize">{report.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Report</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter report name"
                    value={createFormData.name}
                    onChange={(e) => handleCreateFormChange('name', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter report description"
                    value={createFormData.description}
                    onChange={(e) => handleCreateFormChange('description', e.target.value)}
                  />
                </div>
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createFormData.type}
                  onChange={(e) => handleCreateFormChange('type', e.target.value)}
                >
                  <option value="projectStatus">Project Status</option>
                  <option value="teamPerformance">Team Performance</option>
                  <option value="timeTracking">Time Tracking</option>
                  <option value="resourceAllocation">Resource Allocation</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  value={createFormData.dateRange}
                  onChange={(e) => handleCreateFormChange('dateRange', e.target.value)}
                >
                  <option value="lastWeek">Last Week</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="lastQuarter">Last Quarter</option>
                  <option value="lastYear">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                {createFormData.dateRange === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={createFormData.customDateStart}
                        onChange={(e) => handleCreateFormChange('customDateStart', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={createFormData.customDateEnd}
                        onChange={(e) => handleCreateFormChange('customDateEnd', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Visualization Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visualization
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={createFormData.visualization}
                  onChange={(e) => handleCreateFormChange('visualization', e.target.value)}
                >
                  <option value="chart">Chart</option>
                  <option value="table">Table</option>
                  <option value="both">Chart & Table</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateReport}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                {isCreating && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
                Create Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}