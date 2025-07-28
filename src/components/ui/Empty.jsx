import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ title, description, actionLabel, onAction, icon = "Package" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || "No items found"}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {description || "Get started by adding your first item."}
      </p>
      {onAction && (
        <Button onClick={onAction} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="h-4 w-4" />
          {actionLabel || "Add Item"}
        </Button>
      )}
    </div>
  );
};

export default Empty;