import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import teamMemberService, { create, getAll, getWorkloadStats, search, update } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TeamMemberForm from "@/components/molecules/TeamMemberForm";
import TeamMemberCard from "@/components/molecules/TeamMemberCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import Card from "@/components/atoms/Card";
import Pagination from "@/components/atoms/Pagination";
function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workloadStats, setWorkloadStats] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  useEffect(() => {
    fetchMembers();
    fetchWorkloadStats();
  }, []);

  useEffect(() => {
filterMembers();
  }, [members, searchTerm, statusFilter, departmentFilter]);

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter]);
const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await teamMemberService.getAll();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load team members. Please try again.');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

const fetchWorkloadStats = async () => {
    try {
      const stats = await teamMemberService.getWorkloadStats();
      setWorkloadStats(stats);
    } catch (err) {
      console.error('Error fetching workload stats:', err);
    }
  };

const filterMembers = () => {
    let filtered = [...members];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    setFilteredMembers(filtered);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

const handleDeleteMember = async (member) => {
    if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      try {
        await teamMemberService.delete(member.Id);
        setMembers(prev => prev.filter(m => m.Id !== member.Id));
        await fetchWorkloadStats();
        toast.success(`${member.name} has been removed from the team`);
      } catch (err) {
        toast.error('Failed to remove team member. Please try again.');
        console.error('Error deleting team member:', err);
      }
    }
  };

const handleFormSubmit = async (memberData) => {
    try {
      setIsSubmitting(true);
      
      if (editingMember) {
        const updatedMember = await teamMemberService.update(editingMember.Id, memberData);
        setMembers(prev => prev.map(m => m.Id === editingMember.Id ? updatedMember : m));
        toast.success(`${memberData.name} has been updated successfully`);
      } else {
        const newMember = await teamMemberService.create(memberData);
        setMembers(prev => [...prev, newMember]);
        toast.success(`${memberData.name} has been added to the team`);
      }
      
      await fetchWorkloadStats();
      setIsFormOpen(false);
      setEditingMember(null);
    } catch (err) {
      toast.error(editingMember ? 'Failed to update team member' : 'Failed to add team member');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  const departments = [...new Set(members.map(member => member.department))];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchMembers} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team and monitor workload distribution</p>
        </div>
        <Button onClick={handleAddMember} className="mt-4 sm:mt-0">
          <ApperIcon name="UserPlus" size={20} className="mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
<div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(74, 144, 226, 0.1)'}}>
                <ApperIcon name="Users" size={16} style={{color: '#4A90E2'}} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{workloadStats.totalMembers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
<div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                <ApperIcon name="UserCheck" size={16} style={{color: '#4CAF50'}} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{workloadStats.activeMembers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
<div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(241, 196, 15, 0.1)'}}>
                <ApperIcon name="Clock" size={16} style={{color: '#F1C40F'}} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Workload</p>
              <p className="text-2xl font-semibold text-gray-900">{workloadStats.averageWorkload || 0}h</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
<div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(156, 39, 176, 0.1)'}}>
                <ApperIcon name="TrendingUp" size={16} style={{color: '#9C27B0'}} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Capacity Used</p>
              <p className="text-2xl font-semibold text-gray-900">{workloadStats.capacityUtilization || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
<div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(192, 57, 43, 0.1)'}}>
                <ApperIcon name="AlertTriangle" size={16} style={{color: '#C0392B'}} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Overloaded</p>
              <p className="text-2xl font-semibold text-gray-900">{workloadStats.overloadedMembers || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<ApperIcon name="Search" size={20} />}
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Away">Away</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
</Card>

      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid" 
                ? "text-white shadow-sm"
                : "hover:text-gray-900"
            }`}
            style={viewMode === "grid" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
          >
            <ApperIcon name="Grid3X3" size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list" 
                ? "text-white shadow-sm"
                : "hover:text-gray-900"
            }`}
            style={viewMode === "list" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
          >
            <ApperIcon name="List" size={16} />
          </button>
        </div>
      </div>
{/* Team Members Grid */}
{filteredMembers.length === 0 ? (
        <Empty
          title="No team members found"
          description={searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first team member"}
          action={
            <Button onClick={handleAddMember}>
              <ApperIcon name="UserPlus" size={20} className="mr-2" />
              Add Team Member
            </Button>
          }
        />
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedMembers.map((member) => (
              <TeamMemberCard
                key={member.Id}
                member={member}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedMembers.map((member) => (
                    <tr key={member.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'Active' ? 'bg-green-100 text-green-800' :
                          member.status === 'Away' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                member.workloadPercentage <= 75 ? 'bg-green-500' :
                                member.workloadPercentage <= 90 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(member.workloadPercentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{member.workloadPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ApperIcon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        startItem={startIndex + 1}
        endItem={endIndex}
      />

      {/* Team Member Form Modal */}
      <TeamMemberForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        member={editingMember}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default TeamMembers;