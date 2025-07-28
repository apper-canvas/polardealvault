import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StatusFilter from "@/components/molecules/StatusFilter";
import Modal from "@/components/molecules/Modal";
import DealForm from "@/components/organisms/DealForm";
import DealsList from "@/components/organisms/DealsList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import * as dealsService from "@/services/api/dealsService";
import * as platformsService from "@/services/api/platformsService";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dealsData, platformsData] = await Promise.all([
        dealsService.getAll(),
        platformsService.getAll()
      ]);
      setDeals(dealsData);
      setPlatforms(platformsData);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDeal = () => {
    setEditingDeal(null);
    setShowDealModal(true);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowDealModal(true);
  };

  const handleSubmitDeal = async (dealData) => {
    try {
      if (editingDeal) {
        const updatedDeal = await dealsService.update(editingDeal.Id, dealData);
        setDeals(deals.map(d => d.Id === editingDeal.Id ? updatedDeal : d));
        toast.success("Deal updated successfully!");
      } else {
        const newDeal = await dealsService.create(dealData);
        setDeals([newDeal, ...deals]);
        toast.success("Deal added successfully!");
      }
      setShowDealModal(false);
      setEditingDeal(null);
    } catch (err) {
      toast.error("Failed to save deal. Please try again.");
    }
  };

  const handleDeleteDeal = async (deal) => {
    try {
      await dealsService.delete(deal.Id);
      setDeals(deals.filter(d => d.Id !== deal.Id));
      setDeleteConfirm(null);
      toast.success("Deal deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete deal. Please try again.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent">
            Lifetime Deals
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your LTD opportunities</p>
        </div>
        <Button onClick={handleAddDeal} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search deals by name or platform..."
          />
        </div>
        <StatusFilter 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      <DealsList
        deals={deals}
        onEdit={handleEditDeal}
        onDelete={(deal) => setDeleteConfirm(deal)}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
      />

      <Modal
        isOpen={showDealModal}
        onClose={() => {
          setShowDealModal(false);
          setEditingDeal(null);
        }}
        title={editingDeal ? "Edit Deal" : "Add New Deal"}
        size="lg"
      >
        <DealForm
          deal={editingDeal}
          platforms={platforms}
          onSubmit={handleSubmitDeal}
          onCancel={() => {
            setShowDealModal(false);
            setEditingDeal(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Deal"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirm?.productName}"? This action cannot be undone.
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
              onClick={() => handleDeleteDeal(deleteConfirm)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Trash2" className="h-4 w-4" />
              Delete Deal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DealsPage;