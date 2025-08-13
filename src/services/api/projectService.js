class ProjectService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project_c';
    
    // Identify lookup fields from schema
    this.lookupFields = ['client_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "deliverables_c" } },
          { field: { Name: "chat_enabled_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching projects:", error?.response?.data?.message || error.message);
      return [];
    }
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
    
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "deliverables_c" } },
          { field: { Name: "chat_enabled_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, numericId, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error?.response?.data?.message || error.message);
      return null;
    }
  }

  async create(projectData) {
    try {
      // Only include Updateable fields and format lookup fields
      const params = {
        records: [
          {
            Name: projectData.Name || projectData.name,
            Tags: projectData.Tags,
            description_c: projectData.description_c || projectData.description,
            status_c: projectData.status_c || projectData.status || "Planning",
            deadline_c: projectData.deadline_c || projectData.deadline,
            deliverables_c: projectData.deliverables_c || projectData.deliverables,
            chat_enabled_c: projectData.chat_enabled_c !== undefined ? projectData.chat_enabled_c : (projectData.chatEnabled !== undefined ? projectData.chatEnabled : true),
            created_at_c: new Date().toISOString(),
            client_id_c: projectData.client_id_c || parseInt(projectData.clientId) || null
          }
        ]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create projects ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating project:", error?.response?.data?.message || error.message);
      return null;
    }
  }

  async update(id, projectData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: projectData.Name || projectData.name,
            Tags: projectData.Tags,
            description_c: projectData.description_c || projectData.description,
            status_c: projectData.status_c || projectData.status,
            deadline_c: projectData.deadline_c || projectData.deadline,
            deliverables_c: projectData.deliverables_c || projectData.deliverables,
            chat_enabled_c: projectData.chat_enabled_c !== undefined ? projectData.chat_enabled_c : projectData.chatEnabled,
            client_id_c: projectData.client_id_c || (projectData.clientId ? parseInt(projectData.clientId) : undefined)
          }
        ]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update projects ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error updating project:", error?.response?.data?.message || error.message);
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete projects ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
    } catch (error) {
      console.error("Error deleting project:", error?.response?.data?.message || error.message);
      return false;
    }
  }

  // Note: Milestone operations would require a separate milestone table
  // For now, these methods will return empty data
  async getMilestonesByProjectId(projectId) {
    // This would need a separate milestone table in the database
    console.log("Milestone operations require separate milestone table implementation");
    return [];
  }

  async createMilestone(projectId, milestoneData) {
    console.log("Milestone operations require separate milestone table implementation");
    return null;
  }

  async updateMilestone(milestoneId, milestoneData) {
    console.log("Milestone operations require separate milestone table implementation");
    return null;
  }

  async deleteMilestone(milestoneId) {
    console.log("Milestone operations require separate milestone table implementation");
    return false;
  }
}

export default new ProjectService();