import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong. Please try again.", 
  onRetry,
  title = "Error"
}) => {
  return (
<div className="bg-white rounded-lg border p-8 text-center" style={{borderColor: '#E8E8E8'}}>
      <div className="flex justify-center mb-4">
<div className="p-3 rounded-full" style={{backgroundColor: 'rgba(192, 57, 43, 0.1)'}}>
          <ApperIcon name="AlertCircle" size={24} style={{color: '#C0392B'}} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;