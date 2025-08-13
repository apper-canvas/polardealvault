class ClientService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'client_c';
    
    // Identify lookup fields from schema
    this.lookupFields = [];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "company_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "industry_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
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
      console.error("Error fetching clients:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getById(id) {
    if (!id) {
      throw new Error("Client ID is required");
    }
    
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "company_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "industry_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error?.response?.data?.message || error.message);
      return null;
    }
  }

  async create(clientData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [
          {
            Name: clientData.Name || clientData.name,
            Tags: clientData.Tags,
            company_c: clientData.company_c || clientData.company,
            email_c: clientData.email_c || clientData.email,
            phone_c: clientData.phone_c || clientData.phone,
            website_c: clientData.website_c || clientData.website,
            address_c: clientData.address_c || clientData.address,
            industry_c: clientData.industry_c || clientData.industry,
            status_c: clientData.status_c || clientData.status || "Active",
            created_at_c: new Date().toISOString()
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
          console.error(`Failed to create clients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating client:", error?.response?.data?.message || error.message);
      return null;
    }
  }

  async update(id, clientData) {
    try {
      // Only include Updateable fields plus Id
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: clientData.Name || clientData.name,
            Tags: clientData.Tags,
            company_c: clientData.company_c || clientData.company,
            email_c: clientData.email_c || clientData.email,
            phone_c: clientData.phone_c || clientData.phone,
            website_c: clientData.website_c || clientData.website,
            address_c: clientData.address_c || clientData.address,
            industry_c: clientData.industry_c || clientData.industry,
            status_c: clientData.status_c || clientData.status
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
          console.error(`Failed to update clients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error updating client:", error?.response?.data?.message || error.message);
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
          console.error(`Failed to delete clients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
    } catch (error) {
      console.error("Error deleting client:", error?.response?.data?.message || error.message);
      return false;
    }
  }

  async getProjectsByClientId(clientId) {
    try {
      // Import projectService to get projects for this client
      const { default: projectService } = await import("./projectService.js");
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } }
        ],
        where: [
          {
            FieldName: "client_id_c",
            Operator: "EqualTo",
            Values: [parseInt(clientId)]
          }
        ]
      };
      
      const response = await projectService.apperClient.fetchRecords('project_c', params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching projects by client ID:", error?.response?.data?.message || error.message);
      return [];
    }
  }
}

export default new ClientService();