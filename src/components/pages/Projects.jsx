import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { create, getAll, update } from "@/services/api/issueService";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import * as teamMemberService from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import ProjectForm from "@/components/molecules/ProjectForm";
import ProjectCard from "@/components/molecules/ProjectCard";
import CollaborationSection from "@/components/molecules/CollaborationSection";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Pagination from "@/components/atoms/Pagination";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
const Projects = () => {
  const navigate = useNavigate();
const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);

  // Pagination handler functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectsData, clientsData] = await Promise.all([
        projectService.getAll(),
        clientService.getAll()
      ]);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getClientById = (clientId) => {
    return clients.find(client => client.Id === parseInt(clientId));
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectService.create(projectData);
      setProjects(prev => [...prev, newProject]);
      setShowModal(false);
      toast.success("Project created successfully!");
    } catch (err) {
      console.error("Failed to create project:", err);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      const updatedProject = await projectService.update(editingProject.Id, projectData);
      setProjects(prev => 
        prev.map(project => 
          project.Id === editingProject.Id ? updatedProject : project
        )
      );
      setShowModal(false);
      setEditingProject(null);
      toast.success("Project updated successfully!");
    } catch (err) {
      console.error("Failed to update project:", err);
      toast.error("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.delete(projectId);
        setProjects(prev => prev.filter(project => project.Id !== projectId));
        toast.success("Project deleted successfully!");
      } catch (err) {
        console.error("Failed to delete project:", err);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  const openCreateModal = () => {
    if (clients.length === 0) {
      toast.error("Please add at least one client before creating a project.");
      return;
    }
    setEditingProject(null);
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Track and manage your projects</p>
          </div>
        </div>
        <Loading type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Track and manage your projects</p>
          </div>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
<h1 className="text-3xl font-bold gradient-text mb-2">Projects</h1>
          <p className="text-gray-600">Track and manage your projects</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Project
        </Button>
</div>
      
<div className="flex items-center justify-between">
        <Input
          placeholder="Search projects by name, description, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
          className="max-w-md"
        />
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

      {/* Filter and paginate projects */}
      {(() => {
        const filteredProjects = projects.filter(project => {
          if (!searchTerm) return true;
          const client = getClientById(project.clientId);
          return project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        });

        // Pagination calculations
        const totalItems = filteredProjects.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

        return projects.length === 0 ? (
<Empty
            icon="Briefcase"
            title="No projects yet"
            description={clients.length === 0 
              ? "Add some clients first, then create projects for them."
              : "Start organizing your work by creating your first project."
            }
            actionLabel={clients.length === 0 ? null : "Add Project"}
            onAction={clients.length === 0 ? null : openCreateModal}
          />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.Id}
                    project={project}
                    client={getClientById(project.clientId)}
                    onEdit={openEditModal}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedProjects.map((project) => {
                        const client = getClientById(project.clientId);
return (
                          <tr key={project.Id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div 
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() => navigate(`/projects/${project.Id}`)}
                                >
                                  {project.name}
                                </div>
                                {project.description && (
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {project.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {client?.name || 'No Client'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                project.status === 'Active' ? 'bg-green-100 text-green-800' :
                                project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${project.progress || 0}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No due date'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => openEditModal(project)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <ApperIcon name="Edit2" size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(project.Id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <ApperIcon name="Trash2" size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
          </>
        );
      })()}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingProject ? "Edit Project" : "Add New Project"}
        className="max-w-lg"
      >
        <ProjectForm
          project={editingProject}
          clients={clients}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Projects;