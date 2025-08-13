import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const ClientCard = ({ client, onEdit, onDelete, onView }) => {
  const navigate = useNavigate();
  const getStatusBadge = (status) => {
const statusColors = {
      Active: "status-completed",
      Inactive: "status-on-hold", 
      Prospect: "status-in-progress"
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.Active}`}>
        {status}
      </span>
    );
  };
  return (
<Card hover className="p-6">
    <div
        className="cursor-pointer"
        onClick={() => navigate(`/clients/${client.Id}`)}>
        <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>
            <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-600">{client.company}</p>
                {getStatusBadge(client.status)}
            </div>
            <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                    <ApperIcon name="Mail" size={14} className="mr-2" />
                    {client.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <ApperIcon name="Phone" size={14} className="mr-2" />
                    {client.phone}
                </div>
                {client.website && <div className="flex items-center text-sm text-gray-500">
                    <ApperIcon name="Globe" size={14} className="mr-2" />
                    <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 truncate">
                        {client.website}
                    </a>
                </div>}
                {client.address && <div className="flex items-center text-sm text-gray-500">
                    <ApperIcon name="MapPin" size={14} className="mr-2" />
                    <span className="truncate">{client.address}</span>
                </div>}
                {client.industry && <div className="flex items-center text-sm text-gray-500">
                    <ApperIcon name="Building2" size={14} className="mr-2" />
                    {client.industry}
                </div>}
            </div>
        </div>
        <div
            className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400">
                {client.projectCount || 0}projects
                          </div>
            <div className="flex space-x-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        onEdit(client);
                    }}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50">
                    <ApperIcon name="Edit2" size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        onDelete(client.Id);
                    }}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50">
                    <ApperIcon name="Trash2" size={16} />
                </Button>
            </div>
        </div>
    </div>
</Card>
  );
};

export default ClientCard;