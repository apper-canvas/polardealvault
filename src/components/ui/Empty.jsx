import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "Inbox",
  title = "No data found",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction
}) => {
  return (
<div className="bg-white rounded-lg border p-12 text-center" style={{borderColor: '#E8E8E8'}}>
      <div className="flex justify-center mb-6">
<div className="p-4 rounded-full" style={{backgroundColor: 'rgba(158, 158, 158, 0.1)'}}>
          <ApperIcon name={icon} size={32} style={{color: '#9E9E9E'}} />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;