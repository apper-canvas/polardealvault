class TeamMemberService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'team_member_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "current_workload_c" } },
          { field: { Name: "max_capacity_c" } },
          { field: { Name: "completed_tasks_this_month_c" } },
          { field: { Name: "total_tasks_this_month_c" } },
          { field: { Name: "average_task_completion_time_c" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
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
      console.error("Error fetching team members:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getById(id) {
    const memberId = parseInt(id);
    if (isNaN(memberId)) {
      throw new Error('Invalid team member ID');
    }
    
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "current_workload_c" } },
          { field: { Name: "max_capacity_c" } },
          { field: { Name: "completed_tasks_this_month_c" } },
          { field: { Name: "total_tasks_this_month_c" } },
          { field: { Name: "average_task_completion_time_c" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, memberId, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching team member with ID ${id}:`, error?.response?.data?.message || error.message);
      return null;
    }
  }

  async create(memberData) {
    try {
      const params = {
        records: [
          {
            Name: memberData.Name || memberData.name,
            Tags: memberData.Tags,
            email_c: memberData.email_c || memberData.email,
            role_c: memberData.role_c || memberData.role,
            department_c: memberData.department_c || memberData.department,
            status_c: memberData.status_c || memberData.status || "Active",
            avatar_c: memberData.avatar_c || memberData.avatar,
            phone_c: memberData.phone_c || memberData.phone,
            location_c: memberData.location_c || memberData.location,
            start_date_c: memberData.start_date_c || memberData.startDate,
            current_workload_c: memberData.current_workload_c || memberData.currentWorkload || 0,
            max_capacity_c: memberData.max_capacity_c || memberData.maxCapacity || 40,
            completed_tasks_this_month_c: 0,
            total_tasks_this_month_c: 0,
            average_task_completion_time_c: 0
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
      console.error("Error creating team member:", error?.response?.data?.message || error.message);
      return null;
    }
  }

  async update(id, memberData) {
    const memberId = parseInt(id);
    if (isNaN(memberId)) {
      throw new Error('Invalid team member ID');
    }
    
    try {
      const params = {
        records: [
          {
            Id: memberId,
            Name: memberData.Name || memberData.name,
            Tags: memberData.Tags,
            email_c: memberData.email_c || memberData.email,
            role_c: memberData.role_c || memberData.role,
            department_c: memberData.department_c || memberData.department,
            status_c: memberData.status_c || memberData.status,
            avatar_c: memberData.avatar_c || memberData.avatar,
            phone_c: memberData.phone_c || memberData.phone,
            location_c: memberData.location_c || memberData.location,
            start_date_c: memberData.start_date_c || memberData.startDate,
            current_workload_c: memberData.current_workload_c || memberData.currentWorkload,
            max_capacity_c: memberData.max_capacity_c || memberData.maxCapacity,
            completed_tasks_this_month_c: memberData.completed_tasks_this_month_c || memberData.completedTasksThisMonth,
            total_tasks_this_month_c: memberData.total_tasks_this_month_c || memberData.totalTasksThisMonth,
            average_task_completion_time_c: memberData.average_task_completion_time_c || memberData.averageTaskCompletionTime
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
      console.error("Error updating team member:", error?.response?.data?.message || error.message);
      return null;
    }
  }

  async delete(id) {
    const memberId = parseInt(id);
    if (isNaN(memberId)) {
      throw new Error('Invalid team member ID');
    }
    
    try {
      const params = {
        RecordIds: [memberId]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      return response.results ? response.results.some(result => result.success) : false;
    } catch (error) {
      console.error("Error deleting team member:", error?.response?.data?.message || error.message);
      return false;
    }
  }

  async getByStatus(status) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "status_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "department_c" } }
        ],
        where: [
          {
            FieldName: "status_c",
            Operator: "EqualTo",
            Values: [status]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching team members by status:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getByDepartment(department) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "department_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "status_c" } }
        ],
        where: [
          {
            FieldName: "department_c",
            Operator: "EqualTo",
            Values: [department]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error("Error fetching team members by department:", error?.response?.data?.message || error.message);
      return [];
    }
  }
}

const teamMemberService = new TeamMemberService();

// Export individual functions for compatibility
export const getAll = () => teamMemberService.getAll();
export const getById = (id) => teamMemberService.getById(id);
export const create = (memberData) => teamMemberService.create(memberData);
export const update = (id, memberData) => teamMemberService.update(id, memberData);
export const deleteById = (id) => teamMemberService.delete(id);
export const getByStatus = (status) => teamMemberService.getByStatus(status);
export const getByDepartment = (department) => teamMemberService.getByDepartment(department);

export default teamMemberService;