import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";

const Header = ({ onMenuClick, sidebarCollapsed, onToggleCollapse }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [notifications, setNotifications] = useState([
    { Id: 1, title: "New task assigned", message: "John assigned you 'Update API documentation'", time: "2 min ago", read: false },
    { Id: 2, title: "Project milestone reached", message: "Website Redesign project reached 75% completion", time: "1 hour ago", read: false },
    { Id: 3, title: "Comment on issue", message: "Sarah commented on 'Login bug fix'", time: "3 hours ago", read: false },
    { Id: 4, title: "Team meeting reminder", message: "Weekly standup in 30 minutes", time: "1 day ago", read: true }
  ]);
  
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Mock data for search
  const mockSearchData = [
    { type: 'project', title: 'Website Redesign', subtitle: 'Active project' },
    { type: 'task', title: 'Update API documentation', subtitle: 'Due tomorrow' },
    { type: 'issue', title: 'Login bug fix', subtitle: 'High priority' },
    { type: 'team', title: 'John Smith', subtitle: 'Frontend Developer' }
  ];

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        const filtered = mockSearchData.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setShowSearchResults(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (item) => {
    setSearchQuery("");
    setShowSearchResults(false);
    toast.info(`Navigating to ${item.title}`);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      const updatedNotifications = notifications.map(n =>
        n.Id === notification.Id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    }
    setShowNotifications(false);
    toast.info(`Opening: ${notification.title}`);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadNotifications(0);
    toast.success("All notifications marked as read");
  };

  const handleProfileSave = (data) => {
    toast.success("Profile updated successfully");
    setShowProfileModal(false);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    toast.info("Logging out...");
  };

  return (
    <>
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-3 p-2"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          {/* Desktop menu toggle - only show when sidebar is collapsed */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center justify-center p-2 hover:bg-gray-100"
            onClick={onToggleCollapse}
            style={{ display: sidebarCollapsed ? 'flex' : 'none' }}
            title="Expand sidebar"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>

          <div className="lg:hidden flex items-center">
            <div className="p-1.5 rounded-lg mr-2" style={{backgroundColor: 'rgba(74, 144, 226, 0.1)'}}>
              <ApperIcon name="Zap" size={16} style={{color: '#4A90E2'}} />
            </div>
            <span className="text-lg font-bold gradient-text">Project Central</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-4 relative" ref={searchRef}>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search projects, tasks, issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
              icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchResults.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSearchSelect(item)}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <ApperIcon 
                        name={item.type === 'project' ? 'FolderOpen' : item.type === 'task' ? 'CheckSquare' : item.type === 'issue' ? 'AlertCircle' : 'User'} 
                        size={16} 
                        className="text-gray-400" 
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.subtitle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2"
            >
              <ApperIcon name="Bell" size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.Id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{notification.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-2">{notification.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JS
              </div>
              <ApperIcon name="ChevronDown" size={16} className="text-gray-400" />
            </Button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="font-medium text-gray-900">John Smith</div>
                  <div className="text-sm text-gray-500">john.smith@company.com</div>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <ApperIcon name="User" size={16} className="mr-3" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      toast.info("Opening preferences...");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <ApperIcon name="Settings" size={16} className="mr-3" />
                    Preferences
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <ApperIcon name="LogOut" size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Profile Settings Modal */}
    <Modal
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      title="Profile Settings"
      className="max-w-2xl"
    >
      <ProfileSettingsForm onSave={handleProfileSave} onCancel={() => setShowProfileModal(false)} />
    </Modal>
    </>
  );
};

// Profile Settings Form Component
const ProfileSettingsForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    bio: "Frontend Developer with 5+ years experience",
    timezone: "America/New_York",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="h-20"
          />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preferences</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Email notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.pushNotifications}
              onChange={(e) => handleChange('pushNotifications', e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Push notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.weeklyReports}
              onChange={(e) => handleChange('weeklyReports', e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Weekly reports</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
);
};

export default Header;