import { motion } from "framer-motion";
import DealCard from "@/components/molecules/DealCard";

const DealsList = ({ deals, onEdit, onDelete, searchQuery, activeFilter }) => {
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.platform.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || 
                         deal.status.toLowerCase().replace(" ", "") === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  if (filteredDeals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery || activeFilter !== "all" ? "No deals found" : "No deals yet"}
        </h3>
        <p className="text-gray-600 mb-6">
          {searchQuery || activeFilter !== "all" 
            ? "Try adjusting your search or filters" 
            : "Start tracking your first lifetime deal"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {filteredDeals.map((deal) => (
        <motion.div key={deal.Id} variants={itemVariants}>
          <DealCard
            deal={deal}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DealsList;