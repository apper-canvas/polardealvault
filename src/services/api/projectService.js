import projectsData from "@/services/mockData/projects.json";

class ProjectService {
  constructor() {
    this.projects = [...projectsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.projects];
  }

async getById(id) {
    // Validate project ID
    if (!id || id === null || id === undefined || id === '') {
      throw new Error("Valid project ID is required");
    }
    
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error("Valid project ID is required");
    }
    
    await this.delay(200);
    const project = this.projects.find(p => p.Id === numericId);
    if (!project) {
      throw new Error("Project not found");
    }
    return { ...project };
  }

async create(projectData) {
    await this.delay(400);
    const newId = this.projects.length > 0 ? Math.max(...this.projects.map(p => p.Id)) + 1 : 1;
    const newProject = {
      Id: newId,
      ...projectData,
      clientId: parseInt(projectData.clientId),
      status: projectData.status || "Planning",
      startDate: projectData.startDate || "",
      deadline: projectData.deadline || "",
      deliverables: projectData.deliverables || "",
      milestones: [],
      chatEnabled: true,
      createdAt: new Date().toISOString()
    };
    this.projects.push(newProject);
    return { ...newProject };
  }

async update(id, projectData) {
    await this.delay(400);
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    this.projects[index] = {
      ...this.projects[index],
      ...projectData,
      clientId: parseInt(projectData.clientId),
      status: projectData.status || this.projects[index].status,
      startDate: projectData.startDate || this.projects[index].startDate,
      deadline: projectData.deadline || this.projects[index].deadline,
      deliverables: projectData.deliverables || this.projects[index].deliverables,
      chatEnabled: projectData.chatEnabled !== undefined ? projectData.chatEnabled : this.projects[index].chatEnabled
    };
    
    return { ...this.projects[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    this.projects.splice(index, 1);
    return true;
  }

  // Milestone operations
  async getMilestonesByProjectId(projectId) {
    await this.delay(200);
    const project = this.projects.find(p => p.Id === parseInt(projectId));
    if (!project) {
      throw new Error("Project not found");
    }
    return project.milestones ? [...project.milestones] : [];
  }

  async createMilestone(projectId, milestoneData) {
    await this.delay(300);
    const projectIndex = this.projects.findIndex(p => p.Id === parseInt(projectId));
    if (projectIndex === -1) {
      throw new Error("Project not found");
    }

    if (!this.projects[projectIndex].milestones) {
      this.projects[projectIndex].milestones = [];
    }

const allMilestones = this.projects.flatMap(p => p.milestones || []);
    const newId = allMilestones.length > 0 ? Math.max(...allMilestones.map(m => m.Id)) + 1 : 1;
    
    const newMilestone = {
      Id: newId,
      projectId: parseInt(projectId),
      title: milestoneData.title,
      description: milestoneData.description || "",
      startDate: milestoneData.startDate || "",
      dueDate: milestoneData.dueDate,
      isCompleted: false,
      completedDate: null,
      createdAt: new Date().toISOString()
    };

    this.projects[projectIndex].milestones.push(newMilestone);
    return { ...newMilestone };
  }

async updateMilestone(milestoneId, milestoneData) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.milestones) {
        const milestoneIndex = project.milestones.findIndex(m => m.Id === parseInt(milestoneId));
        if (milestoneIndex !== -1) {
          project.milestones[milestoneIndex] = {
            ...project.milestones[milestoneIndex],
            ...milestoneData,
            startDate: milestoneData.startDate || project.milestones[milestoneIndex].startDate
          };
          return { ...project.milestones[milestoneIndex] };
        }
      }
    }
    
    throw new Error("Milestone not found");
  }

  async deleteMilestone(milestoneId) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.milestones) {
        const milestoneIndex = project.milestones.findIndex(m => m.Id === parseInt(milestoneId));
        if (milestoneIndex !== -1) {
          project.milestones.splice(milestoneIndex, 1);
          return true;
        }
      }
    }
    
    throw new Error("Milestone not found");
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
// Wiki document operations
  async getWikiDocuments(projectId) {
    await this.delay(200);
    const project = this.projects.find(p => p.Id === parseInt(projectId));
    if (!project) {
      throw new Error("Project not found");
    }
    return project.wikiDocuments ? [...project.wikiDocuments] : [];
  }

  async createWikiDocument(projectId, docData) {
    await this.delay(300);
    const projectIndex = this.projects.findIndex(p => p.Id === parseInt(projectId));
    if (projectIndex === -1) {
      throw new Error("Project not found");
    }

    if (!this.projects[projectIndex].wikiDocuments) {
      this.projects[projectIndex].wikiDocuments = [];
    }

    const allDocs = this.projects.flatMap(p => p.wikiDocuments || []);
    const newId = allDocs.length > 0 ? Math.max(...allDocs.map(d => d.Id)) + 1 : 1;
    
    const newDoc = {
      Id: newId,
      projectId: parseInt(projectId),
      title: docData.title,
      type: docData.type || 'documentation',
      content: docData.content || '',
      tags: docData.tags || [],
      authorId: docData.authorId,
      versions: [{
        id: 1,
        content: docData.content || '',
        authorId: docData.authorId,
        createdAt: new Date().toISOString(),
        comment: 'Initial version'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects[projectIndex].wikiDocuments.push(newDoc);
    return { ...newDoc };
  }

  async updateWikiDocument(docId, docData) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.wikiDocuments) {
        const docIndex = project.wikiDocuments.findIndex(d => d.Id === parseInt(docId));
        if (docIndex !== -1) {
          const currentDoc = project.wikiDocuments[docIndex];
          
          // Create new version if content changed
          const newVersion = {
            id: (currentDoc.versions?.length || 0) + 1,
            content: docData.content || currentDoc.content,
            authorId: docData.authorId || currentDoc.authorId,
            createdAt: new Date().toISOString(),
            comment: 'Updated content'
          };

          project.wikiDocuments[docIndex] = {
            ...currentDoc,
            ...docData,
            versions: [...(currentDoc.versions || []), newVersion],
            updatedAt: new Date().toISOString()
          };
          return { ...project.wikiDocuments[docIndex] };
        }
      }
    }
    
    throw new Error("Wiki document not found");
  }

  async deleteWikiDocument(docId) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.wikiDocuments) {
        const docIndex = project.wikiDocuments.findIndex(d => d.Id === parseInt(docId));
        if (docIndex !== -1) {
          project.wikiDocuments.splice(docIndex, 1);
          return true;
        }
      }
    }
    
    throw new Error("Wiki document not found");
  }

  // Calendar event operations
  async getCalendarEvents(projectId) {
    await this.delay(200);
    const project = this.projects.find(p => p.Id === parseInt(projectId));
    if (!project) {
      throw new Error("Project not found");
    }
    return project.calendarEvents ? [...project.calendarEvents] : [];
  }

  async createCalendarEvent(projectId, eventData) {
    await this.delay(300);
    const projectIndex = this.projects.findIndex(p => p.Id === parseInt(projectId));
    if (projectIndex === -1) {
      throw new Error("Project not found");
    }

    if (!this.projects[projectIndex].calendarEvents) {
      this.projects[projectIndex].calendarEvents = [];
    }

    const allEvents = this.projects.flatMap(p => p.calendarEvents || []);
    const newId = allEvents.length > 0 ? Math.max(...allEvents.map(e => e.Id)) + 1 : 1;
    
    const newEvent = {
      Id: newId,
      projectId: parseInt(projectId),
      title: eventData.title,
      description: eventData.description || '',
      type: eventData.type || 'meeting',
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      location: eventData.location || '',
      isAllDay: eventData.isAllDay || false,
      invitees: eventData.invitees || [],
      createdBy: eventData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects[projectIndex].calendarEvents.push(newEvent);
    return { ...newEvent };
  }

  async updateCalendarEvent(eventId, eventData) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.calendarEvents) {
        const eventIndex = project.calendarEvents.findIndex(e => e.Id === parseInt(eventId));
        if (eventIndex !== -1) {
          project.calendarEvents[eventIndex] = {
            ...project.calendarEvents[eventIndex],
            ...eventData,
            updatedAt: new Date().toISOString()
          };
          return { ...project.calendarEvents[eventIndex] };
        }
      }
    }
    
    throw new Error("Calendar event not found");
  }

  async deleteCalendarEvent(eventId) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.calendarEvents) {
        const eventIndex = project.calendarEvents.findIndex(e => e.Id === parseInt(eventId));
        if (eventIndex !== -1) {
          project.calendarEvents.splice(eventIndex, 1);
          return true;
        }
      }
    }
    
    throw new Error("Calendar event not found");
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ProjectService();