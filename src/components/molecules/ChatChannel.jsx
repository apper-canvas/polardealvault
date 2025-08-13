import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { create as createIssue, getAll as getAllIssues } from "@/services/api/issueService";
import chatService from "@/services/api/chatService";
import { create as createTeamMember, getAll as getAllTeamMembers } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TeamMemberForm from "@/components/molecules/TeamMemberForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import Card from "@/components/atoms/Card";
const ChatChannel = ({ projectId = null, channelType = 'team', channelName = 'Team Chat' }) => {
const [showThread, setShowThread] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [channelForm, setChannelForm] = useState({ name: '', description: '', type: 'team' });
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUserId = 1; // In a real app, this would come from auth context

  useEffect(() => {
    loadChatData();
  }, [projectId, channelType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
try {
      setLoading(true);
      const [messagesData, membersData] = await Promise.all([
        chatService.getMessagesByChannel(projectId, channelType),
        getAllTeamMembers()
      ]);
      setMessages(messagesData);
      setTeamMembers(membersData);
    } catch (err) {
      setError('Failed to load chat data');
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!channelForm.name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    try {
      setCreatingChannel(true);
      const newChannel = await chatService.createChannel({
        ...channelForm,
        projectId: channelType === 'project' ? projectId : null
      });
      toast.success(`Channel "${newChannel.name}" created successfully`);
      setShowCreateChannel(false);
      setChannelForm({ name: '', description: '', type: 'team' });
      loadChatData(); // Refresh chat data
    } catch (err) {
      toast.error('Failed to create channel');
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleAddTeamMember = async (memberData) => {
    try {
      setAddingMember(true);
      const newMember = await createTeamMember(memberData);
      
      if (channelType === 'team') {
        await chatService.addMemberToChannel(1, newMember.Id); // Add to main team channel
      }
      
      toast.success(`${newMember.name} has been added to the team`);
      setShowAddMember(false);
      loadChatData(); // Refresh to update member list
    } catch (err) {
      toast.error('Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        authorId: currentUserId,
        projectId: projectId,
        channelType: channelType
      };

const createdMessage = await chatService.create(messageData);
      setMessages(prev => [...prev, createdMessage]);
      setNewMessage('');
      toast.success('Message sent');
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await chatService.delete(messageId);
      setMessages(prev => prev.filter(msg => msg.Id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };
const handleOpenThread = async (message) => {
    setSelectedMessage(message);
    setShowThread(true);
    try {
      const replies = await chatService.getThreadReplies(message.Id);
      setThreadReplies(replies);
    } catch (error) {
      toast.error('Failed to load thread');
    }
  };

  const handleSendThreadReply = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMessage) return;

    try {
      const messageData = {
        content: newMessage,
        authorId: 1, // In real app, get from auth
        projectId: projectId,
        channelType: channelType,
        parentId: selectedMessage.Id
      };

      const createdReply = await chatService.create(messageData);
      setThreadReplies(prev => [...prev, createdReply]);
      setNewMessage('');
      toast.success('Reply sent!');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await chatService.addReaction(messageId, emoji, 1); // In real app, get userId from auth
      await loadChatData(); // Refresh to show reactions
      setShowEmojiPicker(null);
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleMentionInput = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check for @ symbol to show mentions
    const beforeCursor = value.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const suggestions = teamMembers.filter(member => 
        member.name.toLowerCase().includes(query)
      ).slice(0, 5);
      
      setMentionSuggestions(suggestions);
      setShowMentions(suggestions.length > 0);
      setCursorPosition(cursorPos);
    } else {
      setShowMentions(false);
    }
    
    setNewMessage(value);
  };

  const handleSelectMention = (member) => {
    const beforeCursor = newMessage.substring(0, cursorPosition);
    const afterCursor = newMessage.substring(cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = beforeCursor.substring(0, mentionMatch.index);
      const newText = `${beforeMention}@${member.name} ${afterCursor}`;
      setNewMessage(newText);
      setShowMentions(false);
    }
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadChatData} />;

return (
    <>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden slack-chat-container">
            {/* Channel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">#</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{channelName}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ApperIcon name="Users" size={16} />
                  <span className="ml-1">{teamMembers.length}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCreateChannel(true)}
                  title="Create Channel"
                >
                  <ApperIcon name="Plus" size={16} />
                  <span className="ml-1 hidden sm:inline">Channel</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddMember(true)}
                  title="Add Team Member"
                >
                  <ApperIcon name="UserPlus" size={16} />
                  <span className="ml-1 hidden sm:inline">Member</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <ApperIcon name="Settings" size={16} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messagesEndRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 slack-messages-container"
            >
              {messages.length === 0 ? (
                <Empty 
                  message="No messages yet"
                  description="Start the conversation by sending the first message!"
                />
              ) : (
                messages.map((message, index) => {
                  const author = getMessageAuthor(teamMembers, message.authorId);
                  const showAuthor = shouldShowAuthor(message, index, messages);
                  const showDate = shouldShowDateSeparator(message, index, messages);
                  
                  return (
                    <div key={message.Id}>
                      {showDate && (
                        <div className="flex items-center my-4">
                          <div className="flex-1 border-t border-gray-200"></div>
                          <span className="px-3 text-sm text-gray-500 bg-white">
                            {formatMessageDate(message.createdAt)}
                          </span>
                          <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                      )}
                      
                      <div className={`slack-message group ${showAuthor ? 'mt-4' : 'mt-1'}`}>
                        <div className="flex items-start space-x-3">
                          {showAuthor ? (
                            <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                              {getInitials(author?.name || 'Unknown')}
                            </div>
                          ) : (
                            <div className="w-9 flex items-center justify-center">
                              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">
                                {format(parseISO(message.createdAt), 'HH:mm')}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            {showAuthor && (
                              <div className="flex items-baseline space-x-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {author?.name || 'Unknown User'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {format(parseISO(message.createdAt), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            )}
                            
                            <div className="text-gray-900 leading-relaxed slack-message-content">
                              {message.content}
                            </div>

                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.reactions.map((reaction, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleAddReaction(message.Id, reaction.emoji)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-gray-600">{reaction.count}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Thread indicator */}
                            {message.hasThread && (
                              <button
                                onClick={() => handleOpenThread(message)}
                                className="flex items-center space-x-2 mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <ApperIcon name="MessageSquare" size={16} />
                                <span>{message.threadCount} replies</span>
                              </button>
                            )}
                          </div>

                          {/* Message Actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === message.Id ? null : message.Id)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <ApperIcon name="Smile" size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenThread(message)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <ApperIcon name="MessageSquare" size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.Id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                              >
                                <ApperIcon name="Trash2" size={16} />
                              </button>
                            </div>

                            {/* Emoji Picker */}
                            {showEmojiPicker === message.Id && (
                              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                                <div className="grid grid-cols-4 gap-1">
                                  {commonEmojis.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleAddReaction(message.Id, emoji)}
                                      className="p-2 hover:bg-gray-100 rounded text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={handleMentionInput}
                      placeholder={`Message #${channelName.toLowerCase()}`}
                      className="w-full pr-12 py-3 slack-message-input"
                      multiline
                      rows={1}
                    />
                    
                    {/* Mention Suggestions */}
                    {showMentions && mentionSuggestions.length > 0 && (
                      <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                        {mentionSuggestions.map(member => (
                          <button
                            key={member.Id}
                            onClick={() => handleSelectMention(member)}
                            className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-left"
                          >
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                              {getInitials(member.name)}
                            </div>
                            <span className="font-medium">{member.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="slack-send-button"
                  >
                    <ApperIcon name="Send" size={16} />
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Thread Sidebar */}
        {showThread && selectedMessage && (
          <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Thread</h3>
              <button
                onClick={() => setShowThread(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original Message */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(getMessageAuthor(teamMembers, selectedMessage.authorId)?.name || 'Unknown')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {getMessageAuthor(teamMembers, selectedMessage.authorId)?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(parseISO(selectedMessage.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="text-gray-900">{selectedMessage.content}</div>
                  </div>
                </div>
              </div>

              {/* Thread Replies */}
              {threadReplies.map(reply => {
                const author = getMessageAuthor(teamMembers, reply.authorId);
                return (
                  <div key={reply.Id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs">
                      {getInitials(author?.name || 'Unknown')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {author?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(parseISO(reply.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <div className="text-gray-900 text-sm">{reply.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thread Reply Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendThreadReply}>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Reply to thread..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <ApperIcon name="Send" size={16} />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      <Modal 
        isOpen={showCreateChannel} 
        onClose={() => setShowCreateChannel(false)}
        title="Create New Channel"
      >
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel Name
            </label>
            <Input
              type="text"
              value={channelForm.name}
              onChange={(e) => setChannelForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. project-alpha, design-team"
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={channelForm.description}
              onChange={(e) => setChannelForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this channel about?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel Type
            </label>
            <select
              value={channelForm.type}
              onChange={(e) => setChannelForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="team">Team Channel</option>
              <option value="project">Project Channel</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateChannel(false)}
              disabled={creatingChannel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creatingChannel}
            >
              {creatingChannel ? (
                <>
                  <ApperIcon name="Loader" size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Channel'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Team Member Modal */}
      <TeamMemberForm
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSubmit={handleAddTeamMember}
        isLoading={addingMember}
      />
    </>
  );
};
// Helper functions
const getMessageAuthor = (teamMembers, authorId) => {
  return teamMembers.find(member => member.Id === authorId) || {
    name: 'Unknown User',
    avatar: null
  };
};

const formatMessageDate = (dateString) => {
  const date = parseISO(dateString);
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMM d at h:mm a');
  }
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const shouldShowDateSeparator = (message, index, messages) => {
  if (index === 0) return true;
  const currentDate = parseISO(message.createdAt);
  const previousDate = parseISO(messages[index - 1].createdAt);
  return format(currentDate, 'yyyy-MM-dd') !== format(previousDate, 'yyyy-MM-dd');
};

const shouldShowAuthor = (message, index, messages) => {
  if (index === 0) return true;
  const previousMessage = messages[index - 1];
  return previousMessage.authorId !== message.authorId ||
         (parseISO(message.createdAt) - parseISO(previousMessage.createdAt)) > 300000; // 5 minutes
};

export default ChatChannel;