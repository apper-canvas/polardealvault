import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subDays } from "date-fns";
import React from "react";
import taskService from "@/services/api/taskService";
import timeEntryService from "@/services/api/timeEntryService";
import projectService from "@/services/api/projectService";
import teamMemberService, { getAll } from "@/services/api/teamMemberService";

class ReportService {
  // Project Status Report Data
  async getProjectStatusData(filters = {}) {
    try {
      const projects = await projectService.getAll();
      const tasks = await taskService.getAll();
      
      let filteredProjects = [...projects];
      
      // Apply filters
      if (filters.projectId) {
        filteredProjects = filteredProjects.filter(p => p.Id === parseInt(filters.projectId));
      }
      
      if (filters.startDate && filters.endDate) {
        filteredProjects = filteredProjects.filter(p => {
          const projectDate = parseISO(p.createdAt);
          return projectDate >= parseISO(filters.startDate) && projectDate <= parseISO(filters.endDate);
        });
      }
      
      // Status distribution for pie chart
      const statusCounts = filteredProjects.reduce((acc, project) => {
        const status = project.status || 'Planning';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      // Progress data for bar chart
      const progressData = filteredProjects.map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.Id);
        const completedTasks = projectTasks.filter(t => t.completed);
        const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
        
        return {
          name: project.name,
          progress: progress,
          status: project.status
        };
      });
      
      return {
        statusDistribution: statusCounts,
        projectProgress: progressData,
        totalProjects: filteredProjects.length
      };
    } catch (error) {
      console.error('Error fetching project status data:', error);
      throw error;
    }
  }
  
  // Team Performance Report Data
  async getTeamPerformanceData(filters = {}) {
    try {
      const teamMembers = await teamMemberService.getAll();
      const tasks = await taskService.getAll();
      
      let filteredMembers = teamMembers.filter(m => m.status === 'Active');
      
      // Apply team member filter
      if (filters.teamMemberId) {
        filteredMembers = filteredMembers.filter(m => m.Id === parseInt(filters.teamMemberId));
      }
      
      // Task completion by team member (bar chart)
      const memberTaskCounts = filteredMembers.map(member => ({
        name: member.name,
        completed: member.completedTasksThisMonth || 0,
        total: member.totalTasksThisMonth || 0,
        completionRate: member.totalTasksThisMonth > 0 ? 
          Math.round((member.completedTasksThisMonth / member.totalTasksThisMonth) * 100) : 0
      }));
      
      // Task completion trends over time (line chart)
      const endDate = new Date();
      const startDate = subDays(endDate, 30);
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const trendData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Simulate daily completion data - in real app this would come from actual daily tracking
        const totalCompleted = filteredMembers.reduce((sum, member) => {
          // Simulate completion pattern based on member data
          const dailyCompletions = Math.floor((member.completedTasksThisMonth || 0) / 30);
          return sum + dailyCompletions + Math.floor(Math.random() * 3);
        }, 0);
        
        return {
          date: dateStr,
          completed: totalCompleted
        };
      });
      
      return {
        memberPerformance: memberTaskCounts,
        completionTrends: trendData,
        totalMembers: filteredMembers.length
      };
    } catch (error) {
      console.error('Error fetching team performance data:', error);
      throw error;
    }
  }
  
  // Time Tracking Report Data
  async getTimeTrackingData(filters = {}) {
    try {
      const timeEntries = await timeEntryService.getAll();
      const projects = await projectService.getAll();
      const teamMembers = await teamMemberService.getAll();
      
      let filteredEntries = [...timeEntries];
      
      // Apply filters
      if (filters.projectId) {
        filteredEntries = filteredEntries.filter(e => e.projectId === parseInt(filters.projectId));
      }
      
      if (filters.teamMemberId) {
        // In real app, time entries would have teamMemberId
        // For now, we'll simulate based on existing data
      }
      
      if (filters.startDate && filters.endDate) {
        filteredEntries = filteredEntries.filter(e => {
          return e.date >= filters.startDate && e.date <= filters.endDate;
        });
      }
      
      // Group time by project and simulate team member assignment
      const projectHours = {};
      const projectMap = projects.reduce((acc, p) => ({ ...acc, [p.Id]: p }), {});
      
      filteredEntries.forEach(entry => {
        const project = projectMap[entry.projectId];
        if (!project) return;
        
        if (!projectHours[project.name]) {
          projectHours[project.name] = {};
        }
        
        // Simulate team member assignment based on project data
        const assignedMembers = teamMembers.slice(0, 3); // Simulate 3 members per project
        assignedMembers.forEach((member, index) => {
          const memberName = member.name;
          if (!projectHours[project.name][memberName]) {
            projectHours[project.name][memberName] = 0;
          }
          // Distribute hours among team members
          projectHours[project.name][memberName] += entry.duration / assignedMembers.length;
        });
      });
      
      // Convert to format suitable for stacked bar chart
      const timeTrackingData = Object.keys(projectHours).map(projectName => {
        const projectData = { project: projectName };
        Object.keys(projectHours[projectName]).forEach(member => {
          projectData[member] = Math.round(projectHours[projectName][member] * 100) / 100;
        });
        return projectData;
      });
      
      // Calculate total hours
      const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      return {
        timeByProject: timeTrackingData,
        totalHours: Math.round(totalHours * 100) / 100,
        totalEntries: filteredEntries.length
      };
    } catch (error) {
      console.error('Error fetching time tracking data:', error);
      throw error;
    }
  }
  
  // Get filter options
  async getFilterOptions() {
    try {
      const [projects, teamMembers] = await Promise.all([
        projectService.getAll(),
        teamMemberService.getAll()
      ]);
      
      return {
        projects: projects.map(p => ({ Id: p.Id, name: p.name })),
        teamMembers: teamMembers.filter(m => m.status === 'Active').map(m => ({ Id: m.Id, name: m.name }))
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
throw error;
    }
  }

  // Resource Allocation Report Data
  async getResourceAllocationData(filters = {}) {
    try {
      const teamMembers = await teamMemberService.getAll();
      const projects = await projectService.getAll();
      
      let filteredMembers = teamMembers.filter(m => m.status === 'Active');
      let filteredProjects = [...projects];
      
      // Apply filters
      if (filters.teamMemberId) {
        filteredMembers = filteredMembers.filter(m => m.Id === parseInt(filters.teamMemberId));
      }
      
      if (filters.projectId) {
        filteredProjects = filteredProjects.filter(p => p.Id === parseInt(filters.projectId));
      }
      
      // Create allocation matrix for heatmap
      const allocationMatrix = [];
      filteredMembers.forEach(member => {
        if (member.currentProjects) {
          member.currentProjects.forEach(project => {
            const projectExists = filteredProjects.find(p => p.Id === project.projectId);
            if (projectExists) {
              allocationMatrix.push({
                memberId: member.Id,
                projectId: project.projectId,
                hoursAllocated: project.hoursAllocated,
                role: project.role
              });
            }
          });
        }
      });
      
      // Calculate summary statistics
      const summary = {
        available: 0,
        atCapacity: 0,
        overAllocated: 0,
        avgUtilization: 0
      };
      
      let totalUtilization = 0;
      filteredMembers.forEach(member => {
        const utilization = (member.currentWorkload / member.maxCapacity) * 100;
        totalUtilization += utilization;
        
        if (utilization <= 80) {
          summary.available++;
        } else if (utilization <= 100) {
          summary.atCapacity++;
        } else {
          summary.overAllocated++;
        }
      });
      
      summary.avgUtilization = filteredMembers.length > 0 ? 
        Math.round(totalUtilization / filteredMembers.length) : 0;
      
      return {
        allocationMatrix,
        teamMembers: filteredMembers,
        projects: filteredProjects,
        summary
      };
    } catch (error) {
      console.error('Error fetching resource allocation data:', error);
      throw error;
    }
  }
// Custom report management
  async createReport(reportData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReport = {
          Id: Date.now(), // Simple ID generation for demo
          ...reportData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store in localStorage for persistence
        const existingReports = this.getCustomReports();
        const updatedReports = [...existingReports, newReport];
        localStorage.setItem('customReports', JSON.stringify(updatedReports));
        
        resolve(newReport);
      }, 500);
    });
  }

  getCustomReports() {
    try {
      const stored = localStorage.getItem('customReports');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom reports:', error);
      return [];
    }
  }

  async updateReport(id, reportData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reports = this.getCustomReports();
        const index = reports.findIndex(r => r.Id === id);
        if (index !== -1) {
          reports[index] = {
            ...reports[index],
            ...reportData,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('customReports', JSON.stringify(reports));
          resolve(reports[index]);
        }
      }, 500);
    });
  }

  async deleteReport(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reports = this.getCustomReports();
        const filteredReports = reports.filter(r => r.Id !== id);
        localStorage.setItem('customReports', JSON.stringify(filteredReports));
        resolve(true);
      }, 500);
    });
  }
}
const reportService = new ReportService();
export default reportService;