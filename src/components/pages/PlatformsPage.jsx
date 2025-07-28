import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";
import PlatformForm from "@/components/organisms/PlatformForm";
import PlatformsList from "@/components/organisms/PlatformsList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import * as platformsService from "@/services/api/platformsService";

const PlatformsPage = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await platformsService.getAll();
      setPlatforms(data);
    } catch (err) {
      setError("Failed to load platforms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const handleAddPlatform = () => {
    setEditingPlatform(null);
    setShowPlatformModal(true);
  };

  const handleEditPlatform = (platform) => {
    setEditingPlatform(platform);
    setShowPlatformModal(true);
  };

  const handleSubmitPlatform = async (platformData) => {
    try {
      if (editingPlatform) {
        const updatedPlatform = await platformsService.update(editingPlatform.Id, platformData);
        setPlatforms(platforms.map(p => p.Id === editingPlatform.Id ? updatedPlatform : p));
        toast.success("Platform updated successfully!");
      } else {
        const newPlatform = await platformsService.create(platformData);
        setPlatforms([newPlatform, ...platforms]);
        toast.success("Platform added successfully!");
      }
      setShowPlatformModal(false);
      setEditingPlatform(null);
    } catch (err) {
      toast.error("Failed to save platform. Please try again.");
    }
  };

  const handleDeletePlatform = async (platform) => {
    try {
      await platformsService.delete(platform.Id);
      setPlatforms(platforms.filter(p => p.Id !== platform.Id));
      setDeleteConfirm(null);
      toast.success("Platform deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete platform. Please try again.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPlatforms} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent">
            Platforms
          </h1>
          <p className="text-gray-600 mt-1">Manage your deal platforms and sources</p>
        </div>
        <Button onClick={handleAddPlatform} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          Add Platform
        </Button>
      </div>

      <PlatformsList
        platforms={platforms}
        onEdit={handleEditPlatform}
        onDelete={(platform) => setDeleteConfirm(platform)}
      />

      <Modal
        isOpen={showPlatformModal}
        onClose={() => {
          setShowPlatformModal(false);
          setEditingPlatform(null);
        }}
        title={editingPlatform ? "Edit Platform" : "Add New Platform"}
      >
        <PlatformForm
          platform={editingPlatform}
          onSubmit={handleSubmitPlatform}
          onCancel={() => {
            setShowPlatformModal(false);
            setEditingPlatform(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Platform"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeletePlatform(deleteConfirm)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Trash2" className="h-4 w-4" />
              Delete Platform
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlatformsPage;