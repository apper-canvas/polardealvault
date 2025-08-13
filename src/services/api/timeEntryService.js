import timeEntriesData from "@/services/mockData/timeEntries.json";
import teamMembersData from "@/services/mockData/teamMembers.json";

class TimeEntryService {
  constructor() {
    this.timeEntries = [...timeEntriesData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.timeEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await this.delay(200);
    const timeEntry = this.timeEntries.find(entry => entry.Id === parseInt(id));
    if (!timeEntry) {
      throw new Error("Time entry not found");
    }
    return { ...timeEntry };
  }

  async getByProjectId(projectId) {
    await this.delay(200);
    return this.timeEntries
      .filter(entry => entry.projectId === parseInt(projectId))
      .map(entry => ({ ...entry }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
// Get time entries by task ID
async getByTaskId(taskId) {
  await this.delay(200);
  return this.timeEntries.filter(entry => entry.taskId === parseInt(taskId));
}

async create(timeEntryData) {
    await this.delay(400);
    const newId = this.timeEntries.length > 0 ? Math.max(...this.timeEntries.map(entry => entry.Id)) + 1 : 1;
    const newTimeEntry = {
      Id: newId,
      ...timeEntryData,
      projectId: parseInt(timeEntryData.projectId),
      taskId: timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null,
      duration: parseFloat(timeEntryData.duration),
      createdAt: new Date().toISOString()
    };
    this.timeEntries.push(newTimeEntry);
    return { ...newTimeEntry };
  }

  async createFromTimer(timeEntryData) {
    // Specialized method for timer-generated entries (no delay for better UX)
    const newId = this.timeEntries.length > 0 ? Math.max(...this.timeEntries.map(entry => entry.Id)) + 1 : 1;
    const newTimeEntry = {
      Id: newId,
...timeEntryData,
      projectId: parseInt(timeEntryData.projectId),
      taskId: timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null,
      duration: parseFloat(timeEntryData.duration),
      createdAt: new Date().toISOString()
    };
    this.timeEntries.push(newTimeEntry);
    return { ...newTimeEntry };
  }

  async update(id, timeEntryData) {
    await this.delay(400);
    const index = this.timeEntries.findIndex(entry => entry.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Time entry not found");
    }
    
this.timeEntries[index] = {
      ...this.timeEntries[index],
      ...timeEntryData,
      projectId: parseInt(timeEntryData.projectId),
      taskId: timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null,
      duration: parseFloat(timeEntryData.duration)
    };
    
    return { ...this.timeEntries[index] };
  }

  async bulkDelete(entryIds) {
    await this.delay(500);
    const idsToDelete = entryIds.map(id => parseInt(id));
    
    this.timeEntries = this.timeEntries.filter(entry => !idsToDelete.includes(entry.Id));
    return true;
  }

  async exportToCSV(entries, projects = []) {
    await this.delay(200);
    
    const projectMap = projects.reduce((acc, project) => {
      acc[project.Id] = project.name;
      return acc;
    }, {});

    const csvHeaders = ['Date', 'Project', 'Description', 'Duration (hours)', 'Created At'];
    const csvRows = entries.map(entry => [
      entry.date,
      projectMap[entry.projectId] || 'Unknown Project',
      `"${entry.description.replace(/"/g, '""')}"`, // Escape quotes
      entry.duration,
      entry.createdAt
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `time-entries-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }

  async getTimesByProject(projectId, startDate, endDate) {
    await this.delay(200);
    
    let entries = this.timeEntries.filter(entry => entry.projectId === parseInt(projectId));
    
    if (startDate) {
      entries = entries.filter(entry => entry.date >= startDate);
    }
    
    if (endDate) {
      entries = entries.filter(entry => entry.date <= endDate);
    }
    
    return entries.map(entry => ({ ...entry }));
  }

  async getTimesByDateRange(startDate, endDate) {
    await this.delay(200);
    
    return this.timeEntries
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .map(entry => ({ ...entry }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getTimeSummaryByProject() {
    await this.delay(200);
    
    const summary = this.timeEntries.reduce((acc, entry) => {
      const projectId = entry.projectId;
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          totalHours: 0,
          totalEntries: 0,
          dates: []
        };
      }
      
      acc[projectId].totalHours += entry.duration;
      acc[projectId].totalEntries += 1;
      acc[projectId].dates.push(entry.date);
      
      return acc;
    }, {});

    // Get unique dates and sort them
    Object.values(summary).forEach(project => {
      project.dates = [...new Set(project.dates)].sort();
      project.totalHours = Math.round(project.totalHours * 100) / 100;
    });

    return Object.values(summary);
  }

  async searchEntries(searchTerm) {
    await this.delay(200);
    
    if (!searchTerm || searchTerm.trim() === '') {
      return [...this.timeEntries];
    }
    
    const term = searchTerm.toLowerCase();
    return this.timeEntries
      .filter(entry => 
        entry.description.toLowerCase().includes(term) ||
        entry.date.includes(term)
      )
      .map(entry => ({ ...entry }));
  }

  async delete(id) {
    await this.delay(300);
    const index = this.timeEntries.findIndex(entry => entry.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Time entry not found");
    }
    
    this.timeEntries.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TimeEntryService();