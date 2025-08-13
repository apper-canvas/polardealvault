import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import TeamMemberForm from "@/components/molecules/TeamMemberForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Projects from "@/components/pages/Projects";
import Tasks from "@/components/pages/Tasks";
import teamMemberService from "@/services/api/teamMemberService";
import projectService from "@/services/api/projectService";

function TeamMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    fetchMemberDetails();
    fetchProjects();
  }, [id]);

const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const memberData = await teamMemberService.getById(id);
      if (!memberData) {
        setError('Team member not found');
        return;
      }
      setMember(memberData);
      setError(null);
    } catch (err) {
      setError('Failed to load team member details. Please try again.');
      console.error('Error fetching team member:', err);
    } finally {
      setLoading(false);
    }
  };

const fetchProjects = async () => {
    try {
      const projectData = await projectService.getAll();
      setProjects(projectData || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    }
  };

  const handleEdit = () => {
    setIsFormOpen(true);
  };

const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${member?.name} from the team? This action cannot be undone.`)) {
      try {
        await teamMemberService.delete(member.Id);
        toast.success(`${member.name} has been removed from the team`);
        navigate('/team');
      } catch (err) {
        toast.error('Failed to remove team member. Please try again.');
        console.error('Error deleting team member:', err);
      }
    }
  };

  const handleFormSubmit = async (memberData) => {
    try {
      setIsSubmitting(true);
      const updatedMember = await teamMemberService.update(member.Id, memberData);
      setMember(updatedMember);
      setIsFormOpen(false);
      toast.success(`${memberData.name} has been updated successfully`);
    } catch (err) {
      toast.error('Failed to update team member');
      console.error('Error updating team member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      Away: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      Inactive: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    const config = statusConfig[status] || statusConfig.Inactive;
    return `${config.bg} ${config.text} ${config.border}`;
  };

  const getWorkloadColor = (workload, maxCapacity) => {
    const percentage = (workload / maxCapacity) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWorkloadBarColor = (workload, maxCapacity) => {
    const percentage = (workload / maxCapacity) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProjectDetails = (projectId) => {
    return projects.find(p => p.Id === projectId);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchMemberDetails} />;
  if (!member) return <Error message="Team member not found" />;

  const workloadPercentage = Math.min((member.currentWorkload / member.maxCapacity) * 100, 100);
  const taskCompletionRate = member.totalTasksThisMonth > 0 
    ? Math.round((member.completedTasksThisMonth / member.totalTasksThisMonth) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/team')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
          Back to Team
        </Button>
      </div>

      {/* Member Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=96`;
                }}
              />
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${
                member.status === 'Active' ? 'bg-green-500' : 
                member.status === 'Away' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(member.status)}`}>
                  {member.status}
                </span>
              </div>
              <p className="text-xl text-gray-600 mb-1">{member.role}</p>
              <p className="text-lg text-gray-500 mb-4">{member.department}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <ApperIcon name="Mail" size={16} className="mr-2" />
                  <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <ApperIcon name="Phone" size={16} className="mr-2" />
                  <span>{member.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <ApperIcon name="MapPin" size={16} className="mr-2" />
                  <span>{member.location}</span>
                </div>
                <div className="flex items-center">
                  <ApperIcon name="Calendar" size={16} className="mr-2" />
                  <span>Started {format(new Date(member.startDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6 lg:mt-0">
            <Button variant="outline" onClick={handleEdit}>
              <ApperIcon name="Edit" size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
              <ApperIcon name="Trash2" size={16} className="mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Current Workload</h3>
            <span className={`text-sm font-semibold ${getWorkloadColor(member.currentWorkload, member.maxCapacity)}`}>
              {member.currentWorkload}h / {member.maxCapacity}h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getWorkloadBarColor(member.currentWorkload, member.maxCapacity)}`}
              style={{ width: `${workloadPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{workloadPercentage.toFixed(1)}% capacity used</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
            <span className="text-2xl font-bold text-blue-600">{member.currentProjects.length}</span>
          </div>
          <div className="text-xs text-gray-500">
            {member.currentProjects.reduce((sum, project) => sum + project.hoursAllocated, 0)} hours allocated
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Task Completion</h3>
            <span className="text-2xl font-bold text-green-600">{taskCompletionRate}%</span>
          </div>
          <div className="text-xs text-gray-500">
            {member.completedTasksThisMonth} of {member.totalTasksThisMonth} tasks this month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Avg. Completion Time</h3>
            <span className="text-2xl font-bold text-purple-600">{member.averageTaskCompletionTime}d</span>
          </div>
          <div className="text-xs text-gray-500">Per task average</div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Current Projects</h2>
            <ApperIcon name="Briefcase" size={20} className="text-gray-400" />
          </div>
          
          {member.currentProjects.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Briefcase" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No active projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              {member.currentProjects.map((project, index) => {
                const projectDetails = getProjectDetails(project.projectId);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{project.projectName}</h3>
                      <span className="text-sm text-gray-500">{project.hoursAllocated}h</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.role}</p>
                    {projectDetails && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                          projectDetails.status === 'Active' ? 'bg-green-100 text-green-800' :
                          projectDetails.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                          projectDetails.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {projectDetails.status}
                        </span>
                        <span>Due: {format(new Date(projectDetails.endDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Skills & Info */}
        <div className="space-y-6">
          {/* Skills */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              <ApperIcon name="Award" size={20} className="text-gray-400" />
            </div>
            
            {member.skills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No skills listed</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance This Month</h2>
              <ApperIcon name="TrendingUp" size={20} className="text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="font-semibold">{member.completedTasksThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasks Assigned</span>
                <span className="font-semibold">{member.totalTasksThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">{taskCompletionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Task Time</span>
                <span className="font-semibold">{member.averageTaskCompletionTime} days</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      <TeamMemberForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        member={member}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default TeamMemberDetail;