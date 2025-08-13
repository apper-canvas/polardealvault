import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Modal from "@/components/atoms/Modal";
import ClientForm from "@/components/molecules/ClientForm";
import ProjectForm from "@/components/molecules/ProjectForm";
import ProjectCard from "@/components/molecules/ProjectCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [clientData, projectsData] = await Promise.all([
        clientService.getById(id),
        clientService.getProjectsByClientId(id)
      ]);
      
      setClient(clientData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load client data:", err);
      setError("Failed to load client information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [id]);

  const handleEditClient = async (clientData) => {
    try {
      const updatedClient = await clientService.update(client.Id, clientData);
      setClient(updatedClient);
      setShowEditModal(false);
      toast.success("Client updated successfully!");
    } catch (err) {
      console.error("Failed to update client:", err);
      toast.error("Failed to update client. Please try again.");
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectService.create({
        ...projectData,
        clientId: client.Id
      });
      setProjects(prev => [...prev, newProject]);
      setShowProjectModal(false);
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
      setShowProjectModal(false);
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

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const openEditProjectModal = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const getStatusBadge = (status) => {
const statusColors = {
      Active: "status-completed",
      Inactive: "status-on-hold", 
      Prospect: "status-in-progress"
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[status] || statusColors.Active}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Clients
          </Button>
        </div>
        <Loading type="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Clients
          </Button>
        </div>
        <Error message={error} onRetry={loadClientData} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Clients
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Client not found</h2>
          <p className="text-gray-600">The requested client could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Clients
          </Button>
          <div>
<h1 className="text-3xl font-bold gradient-text mb-2">{client.name}</h1>
            <p className="text-gray-600">Client Details & Projects</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={openEditModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Edit2" size={16} />
            Edit Client
          </Button>
          <Button
            variant="primary"
            onClick={openCreateProjectModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            New Project
          </Button>
        </div>
      </div>

      {/* Client Information */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
          </div>
{getStatusBadge(client.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <p className="text-gray-900">{client.company}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="flex items-center">
              <ApperIcon name="Mail" size={16} className="mr-2 text-gray-500" />
              <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                {client.email}
              </a>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="flex items-center">
              <ApperIcon name="Phone" size={16} className="mr-2 text-gray-500" />
              <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800">
                {client.phone}
              </a>
            </div>
          </div>
          
          {client.address && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="flex items-start">
                <ApperIcon name="MapPin" size={16} className="mr-2 text-gray-500 mt-0.5" />
                <p className="text-gray-900">{client.address}</p>
              </div>
            </div>
          )}
          
          {client.website && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <div className="flex items-center">
                <ApperIcon name="Globe" size={16} className="mr-2 text-gray-500" />
                <a 
                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {client.website}
                </a>
              </div>
            </div>
          )}
          
          {client.industry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <p className="text-gray-900">{client.industry}</p>
            </div>
          )}
        </div>
        
        {client.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <p className="text-gray-900 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </Card>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Projects ({projects.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreateProjectModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Empty
            icon="Briefcase"
            title="No projects yet"
            description="Start by creating the first project for this client."
            actionLabel="Create Project"
            onAction={openCreateProjectModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.Id}
                project={project}
                client={client}
                onEdit={openEditProjectModal}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModals}
        title="Edit Client"
        className="max-w-lg"
      >
        <ClientForm
          client={client}
          onSubmit={handleEditClient}
          onCancel={closeModals}
        />
      </Modal>

      {/* Create/Edit Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={closeModals}
        title={editingProject ? "Edit Project" : "Create New Project"}
        className="max-w-lg"
      >
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={closeModals}
        />
      </Modal>
    </div>
  );
};

export default ClientDetail;