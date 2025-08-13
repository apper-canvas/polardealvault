class TimeEntryService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'time_entry_c';
    
    // Identify lookup fields from schema
    this.lookupFields = ['project_id_c', 'task_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
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
      console.error("Error fetching time entries:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching time entry with ID ${id}:`, error?.response?.data?.message || error.message);
      return null;
    }
  }

  async getByProjectId(projectId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching time entries by project ID:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getByTaskId(taskId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "task_id_c",
            Operator: "EqualTo",
            Values: [parseInt(taskId)]
          }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching time entries by task ID:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async create(timeEntryData) {
    try {
      const params = {
        records: [
          {
            Name: timeEntryData.Name || `Time Entry ${new Date().toLocaleDateString()}`,
            Tags: timeEntryData.Tags,
            description_c: timeEntryData.description_c || timeEntryData.description,
            date_c: timeEntryData.date_c || timeEntryData.date || new Date().toISOString().split('T')[0],
            duration_c: parseFloat(timeEntryData.duration_c || timeEntryData.duration),
            created_at_c: new Date().toISOString(),
            project_id_c: timeEntryData.project_id_c || parseInt(timeEntryData.projectId),
            task_id_c: timeEntryData.task_id_c || (timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null)
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
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating time entry:", error?.response?.data?.message || error.message);
      return null;
    }
  }

  async createFromTimer(timeEntryData) {
    // Specialized method for timer-generated entries
    return this.create(timeEntryData);
  }

  async update(id, timeEntryData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: timeEntryData.Name,
            Tags: timeEntryData.Tags,
            description_c: timeEntryData.description_c || timeEntryData.description,
            date_c: timeEntryData.date_c || timeEntryData.date,
            duration_c: parseFloat(timeEntryData.duration_c || timeEntryData.duration),
            project_id_c: timeEntryData.project_id_c || (timeEntryData.projectId ? parseInt(timeEntryData.projectId) : undefined),
            task_id_c: timeEntryData.task_id_c || (timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null)
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
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error updating time entry:", error?.response?.data?.message || error.message);
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
      
      return response.results ? response.results.some(result => result.success) : false;
    } catch (error) {
      console.error("Error deleting time entry:", error?.response?.data?.message || error.message);
      return false;
    }
  }

  async bulkDelete(entryIds) {
    try {
      const params = {
        RecordIds: entryIds.map(id => parseInt(id))
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      return response.results ? response.results.every(result => result.success) : false;
    } catch (error) {
      console.error("Error bulk deleting time entries:", error?.response?.data?.message || error.message);
      return false;
    }
  }

  async getTimesByProject(projectId, startDate, endDate) {
    try {
      const whereConditions = [
        {
          FieldName: "project_id_c",
          Operator: "EqualTo",
          Values: [parseInt(projectId)]
        }
      ];
      
      if (startDate) {
        whereConditions.push({
          FieldName: "date_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [startDate]
        });
      }
      
      if (endDate) {
        whereConditions.push({
          FieldName: "date_c",
          Operator: "LessThanOrEqualTo",
          Values: [endDate]
        });
      }
      
      const params = {
        fields: [
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_id_c" } }
        ],
        where: whereConditions,
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching times by project:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getTimesByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: [
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_id_c" } }
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          },
          {
            FieldName: "date_c",
            Operator: "LessThanOrEqualTo",
            Values: [endDate]
          }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching times by date range:", error?.response?.data?.message || error.message);
      return [];
    }
  }
}

export default new TimeEntryService();