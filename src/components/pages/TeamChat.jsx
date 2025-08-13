import React, { useState, useEffect } from 'react';
import ChatChannel from '@/components/molecules/ChatChannel';
import chatService from '@/services/api/chatService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
const TeamChat = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const teamChannels = await chatService.getChannelsByType('team');
      setChannels(teamChannels);
      if (teamChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(teamChannels[0]);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
<div className="flex h-full">
      {/* Channel Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Team Channels</h2>
          <p className="text-sm text-gray-600">
            {channels.length} channel{channels.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {channels.map(channel => (
            <button
              key={channel.Id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 transition-colors ${
                selectedChannel?.Id === channel.Id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Hash" size={16} className="text-gray-500" />
                  <span className="font-medium text-gray-900">{channel.name}</span>
                </div>
                <span className="text-xs text-gray-500">{channel.memberCount}</span>
              </div>
              {channel.description && (
                <p className="text-xs text-gray-600 mt-1 truncate">{channel.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {selectedChannel ? (
          <ChatChannel 
            channelType="team"
            channelName={selectedChannel.name}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ApperIcon name="MessageCircle" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Channel Selected</h3>
              <p className="text-gray-600">Select a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
);
};

export default TeamChat;