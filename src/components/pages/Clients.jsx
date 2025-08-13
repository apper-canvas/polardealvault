import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "@/components/atoms/Pagination";
import clientService from "@/services/api/clientService";
import { create, getAll, update } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import ClientCard from "@/components/molecules/ClientCard";
import ClientForm from "@/components/molecules/ClientForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Projects from "@/components/pages/Projects";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";

const Clients = () => {
  const navigate = useNavigate();
const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
const filteredClients = (clients || []).filter(client => {
    if (!client) return false;
    
    const matchesStatus = statusFilter === "All" || client.status === statusFilter;
    const matchesSearch = !searchTerm || 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

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
  }, [statusFilter, searchTerm]);

const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await clientService.getAll();
      
      // Validate received data
      if (!Array.isArray(data)) {
        throw new Error("Invalid client data format received");
      }
      
      setClients(data || []);
    } catch (err) {
      console.error("Failed to load clients:", err);
      const errorMessage = err?.message?.includes("Client not found") 
        ? "No clients found in the system."
        : err?.message || "Failed to load clients. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

const handleCreateClient = async (clientData) => {
    try {
      if (!clientData) {
        throw new Error("Client data is required");
      }
      
      const newClient = await clientService.create(clientData);
      if (!newClient) {
        throw new Error("Failed to create client - no data returned");
      }
      
      setClients(prev => [...(prev || []), newClient]);
      setShowModal(false);
      toast.success("Client created successfully!");
    } catch (err) {
      console.error("Failed to create client:", err);
      const errorMessage = err?.message || "Failed to create client. Please try again.";
      toast.error(errorMessage);
    }
  };

const handleEditClient = async (clientData) => {
    try {
      if (!editingClient?.Id) {
        throw new Error("No client selected for editing");
      }
      
      if (!clientData) {
        throw new Error("Client data is required");
      }
      
      const updatedClient = await clientService.update(editingClient.Id, clientData);
      if (!updatedClient) {
        throw new Error("Failed to update client - no data returned");
      }
      
      setClients(prev => 
        (prev || []).map(client => 
          client?.Id === editingClient.Id ? updatedClient : client
        )
      );
      setShowModal(false);
      setEditingClient(null);
      toast.success("Client updated successfully!");
    } catch (err) {
      console.error("Failed to update client:", err);
      const errorMessage = err?.message || "Failed to update client. Please try again.";
      toast.error(errorMessage);
    }
  };

const handleDeleteClient = async (clientId) => {
    if (!clientId) {
      toast.error("Invalid client ID");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await clientService.delete(clientId);
        setClients(prev => (prev || []).filter(client => client?.Id !== clientId));
        toast.success("Client deleted successfully!");
      } catch (err) {
        console.error("Failed to delete client:", err);
        const errorMessage = err?.message?.includes("Client not found")
          ? "Client not found - it may have already been deleted."
          : err?.message || "Failed to delete client. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };
  const handleViewClient = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships</p>
          </div>
        </div>
        <Error message={error} onRetry={loadClients} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
            <ApperIcon name="Plus" size={16} className="mr-2" />Add Client
                    </Button>
    </div>
    <div className="space-y-4">
        <Input
            placeholder="Search clients by name, email, company, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
            className="max-w-md" />
<div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
                <ApperIcon name="Filter" size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
{["All", "Active", "Inactive", "Prospect"].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      aria-label={`Filter clients by ${status} status`}
                      aria-pressed={statusFilter === status}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        statusFilter === status 
                          ? "text-white border focus:ring-blue-500" 
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-300"
                      }`}
                      style={statusFilter === status ? {
                        backgroundColor: 'var(--color-primary)', 
                        borderColor: 'var(--color-primary)'
                      } : {}}
                    >
                      {status}
                      {status !== "All" && (
                        <span className="ml-1 text-xs opacity-75">
                          ({clients.filter(c => c.status === status).length})
                        </span>
                      )}
                    </button>
                  ))}
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    viewMode === "grid" 
                      ? "text-white shadow-sm focus:ring-blue-500"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200 focus:ring-gray-300"
                  }`}
                  style={viewMode === "grid" ? {
                    backgroundColor: 'var(--color-primary)', 
                    color: 'white'
                  } : {}}
                >
                  <ApperIcon name="Grid3X3" size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    viewMode === "list" 
                      ? "text-white shadow-sm focus:ring-blue-500"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200 focus:ring-gray-300"
                  }`}
                  style={viewMode === "list" ? {
                    backgroundColor: 'var(--color-primary)', 
                    color: 'white'
                  } : {}}
                >
                  <ApperIcon name="List" size={16} />
                </button>
              </div>
            </div>
        </div>
{clients.length === 0 ? <Empty
            icon="Users"
            title="No clients yet"
            description="Start building your client base by adding your first client."
            actionLabel="Add Client"
            onAction={openCreateModal} /> : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedClients.map(client => <ClientCard
                  key={client.Id}
                  client={client}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClient}
                  onView={handleViewClient} />)}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
{paginatedClients.map((client) => (
                      <tr key={client.Id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-800">
                                  {client.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div 
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/clients/${client.Id}`)}
                              >
                                {client.name}
                              </div>
                              {client.company && (
                                <div className="text-sm text-gray-500">{client.company}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.email}</div>
                          {client.phone && (
                            <div className="text-sm text-gray-500">{client.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === 'Active' ? 'status-completed' :
                            client.status === 'Inactive' ? 'status-on-hold' :
                            'status-in-progress'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.projectCount || 0} projects
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'Never'}
                        </td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClient(client.Id)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                            >
                              <ApperIcon name="Eye" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(client)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                            >
                              <ApperIcon name="Edit2" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(client.Id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

        <Modal
            isOpen={showModal}
            onClose={closeModal}
            title={editingClient ? "Edit Client" : "Add New Client"}
            className="max-w-lg">
            <ClientForm
                client={editingClient}
                onSubmit={editingClient ? handleEditClient : handleCreateClient}
onCancel={closeModal} />
        </Modal>
    </div>
    </div>
  );
};

export default Clients;