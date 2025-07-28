import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Deals", href: "/", icon: "Zap" },
    { name: "Platforms", href: "/platforms", icon: "Globe" },
    { name: "Dashboard", href: "/dashboard", icon: "BarChart3" }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent">
            DealVault
          </h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <ApperIcon 
                  name={item.icon} 
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-primary-600"
                  )} 
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onClose}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 translate-x-0">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;