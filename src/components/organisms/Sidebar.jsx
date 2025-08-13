import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Clients", href: "/clients", icon: "Users" },
    { name: "Projects", href: "/projects", icon: "Briefcase" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
    { name: "Team", href: "/team", icon: "Users" },
    { name: "Chat", href: "/chat", icon: "MessageCircle" },
    { name: "Activity Feed", href: "/activity-feed", icon: "Bell" },
    { name: "Time Tracking", href: "/time-tracking", icon: "Clock" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ];

  return (
    <>
      {/* Mobile backdrop */}
{isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar */}
<div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto gradient-bg">
          <div className="flex items-center flex-shrink-0 px-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ApperIcon name="Zap" size={24} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">Project Central</span>
</div>
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 mx-2 mb-4 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ApperIcon 
                name={isCollapsed ? "ChevronRight" : "ChevronLeft"} 
                size={20} 
              />
            </button>
          </div>
          <nav className="mt-8 flex-1 px-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
isActive
                        ? "bg-white bg-opacity-20 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                    }`
                  }
                >
                  <ApperIcon 
                    name={item.icon} 
                    size={20} 
className={`flex-shrink-0 ${isCollapsed ? 'lg:mr-0' : 'mr-3'}`} 
                  />
                  <span className={`transition-opacity duration-300 ${
                    isCollapsed ? 'lg:hidden' : 'block'
                  }`}>
                    {item.name}
                  </span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
<div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full gradient-bg">
          <div className="flex items-center justify-between flex-shrink-0 px-6 py-4">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ApperIcon name="Zap" size={24} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">Project Central</span>
            </div>
            <button
onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 pb-4">
            <div className="space-y-2">
              {navigation.map((item) => (
<NavLink
                  key={item.name}
                  to={item.href}
onClick={() => {
                    onClose();
                  }}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white bg-opacity-20 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                    }`
                  }
                >
                  <ApperIcon 
                    name={item.icon} 
                    size={20} 
                    className="mr-3 flex-shrink-0" 
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;