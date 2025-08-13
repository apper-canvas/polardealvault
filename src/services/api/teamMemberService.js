import mockTeamMembers from '@/services/mockData/teamMembers.json';

// In-memory storage (simulates a database)
let teamMembers = [...mockTeamMembers];
let nextId = Math.max(...teamMembers.map(member => member.Id)) + 1;

// Helper function to create a deep copy
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

// Get all team members
export const getAll = () => {
  return deepCopy(teamMembers);
};

// Get team member by ID
export const getById = (id) => {
  const memberId = parseInt(id);
  if (isNaN(memberId)) {
    throw new Error('Invalid team member ID');
  }
  
  const member = teamMembers.find(member => member.Id === memberId);
  return member ? deepCopy(member) : null;
};

// Create new team member
export const create = (memberData) => {
  const newMember = {
    ...memberData,
    Id: nextId++,
    currentWorkload: 0,
    currentProjects: [],
    completedTasksThisMonth: 0,
    totalTasksThisMonth: 0,
    averageTaskCompletionTime: 0
  };
  
  teamMembers.push(newMember);
  return deepCopy(newMember);
};

// Update team member
export const update = (id, memberData) => {
  const memberId = parseInt(id);
  if (isNaN(memberId)) {
    throw new Error('Invalid team member ID');
  }
  
  const index = teamMembers.findIndex(member => member.Id === memberId);
  if (index === -1) {
    throw new Error('Team member not found');
  }
  
  teamMembers[index] = {
    ...teamMembers[index],
    ...memberData,
    Id: memberId // Ensure ID cannot be changed
  };
  
  return deepCopy(teamMembers[index]);
};

// Delete team member
export const deleteById = (id) => {
  const memberId = parseInt(id);
  if (isNaN(memberId)) {
    throw new Error('Invalid team member ID');
  }
  
  const index = teamMembers.findIndex(member => member.Id === memberId);
  if (index === -1) {
    throw new Error('Team member not found');
  }
  
  teamMembers.splice(index, 1);
  return true;
};

// Get team members by status
export const getByStatus = (status) => {
  return deepCopy(teamMembers.filter(member => member.status === status));
};

// Get team members by department
export const getByDepartment = (department) => {
  return deepCopy(teamMembers.filter(member => member.department === department));
};

// Search team members
export const search = (query) => {
  const searchTerm = query.toLowerCase();
  return deepCopy(teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm) ||
    member.role.toLowerCase().includes(searchTerm) ||
    member.department.toLowerCase().includes(searchTerm)
  ));
};

// Get workload statistics
export const getWorkloadStats = () => {
  const activeMembers = teamMembers.filter(member => member.status === 'Active');
  const totalCapacity = activeMembers.reduce((sum, member) => sum + member.maxCapacity, 0);
  const totalWorkload = activeMembers.reduce((sum, member) => sum + member.currentWorkload, 0);
  
  return {
    totalMembers: teamMembers.length,
    activeMembers: activeMembers.length,
    averageWorkload: activeMembers.length > 0 ? Math.round(totalWorkload / activeMembers.length) : 0,
    capacityUtilization: totalCapacity > 0 ? Math.round((totalWorkload / totalCapacity) * 100) : 0,
    overloadedMembers: activeMembers.filter(member => member.currentWorkload > member.maxCapacity).length
  };
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
  getByStatus,
  getByDepartment,
  search,
  getWorkloadStats
};