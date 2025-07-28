import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const StatusFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: "all", label: "All Deals" },
    { key: "active", label: "Active" },
    { key: "coming", label: "Coming Soon" },
    { key: "expired", label: "Expired" },
    { key: "soldout", label: "Sold Out" }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            "transition-all duration-200",
            activeFilter === filter.key 
              ? "shadow-lg" 
              : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default StatusFilter;