import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const StatCard = ({ title, value, icon, color = "blue" }) => {
const colorClasses = {
    blue: "text-blue-600" ,
    green: "text-green-600",
    purple: "text-purple-600", 
    orange: "text-orange-600",
    red: "text-red-600"
  };

  const backgroundClasses = {
    blue: "rgba(74, 144, 226, 0.1)",
    green: "rgba(76, 175, 80, 0.1)", 
    purple: "rgba(156, 39, 176, 0.1)",
    orange: "rgba(241, 196, 15, 0.1)",
    red: "rgba(192, 57, 43, 0.1)"
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold gradient-text">{value}</p>
        </div>
<div className={`p-3 rounded-lg ${colorClasses[color]}`} style={{backgroundColor: backgroundClasses[color]}}>
          <ApperIcon name={icon} size={24} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;