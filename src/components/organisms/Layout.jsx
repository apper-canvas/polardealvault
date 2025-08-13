import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TimerWidget from "@/components/molecules/TimerWidget";
import RecentActivityPanel from "@/components/molecules/RecentActivityPanel";
import { TimerProvider } from "@/contexts/TimerContext";

const Layout = ({ children }) => {
const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

return (
    <TimerProvider>
<div className="h-screen flex" style={{backgroundColor: '#FAFAFA'}}>
<Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
<div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}>
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
        
<TimerWidget />
        <RecentActivityPanel 
          isOpen={activityPanelOpen}
          onToggle={() => setActivityPanelOpen(!activityPanelOpen)}
        />
      </div>
    </TimerProvider>
  );
};

export default Layout;