import chatMessagesData from '@/services/mockData/chatMessages.json';

class ChatService {
constructor() {
    this.messages = [...chatMessagesData];
    this.reactions = [];
    this.threads = [];
    this.channels = [
      { Id: 1, name: 'Team Chat', type: 'team', projectId: null, createdAt: new Date().toISOString(), memberCount: 5 },
      { Id: 2, name: 'E-commerce Platform', type: 'project', projectId: 1, createdAt: new Date().toISOString(), memberCount: 3 },
      { Id: 3, name: 'Mobile App Dev', type: 'project', projectId: 2, createdAt: new Date().toISOString(), memberCount: 2 },
      { Id: 4, name: 'Marketing Website', type: 'project', projectId: 3, createdAt: new Date().toISOString(), memberCount: 2 }
    ];
    this.nextChannelId = 5;
  }

  // Simulate network delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay(300);
    return [...this.messages];
  }

  async getById(id) {
    await this.delay(200);
    const message = this.messages.find(m => m.Id === parseInt(id));
    if (!message) {
      throw new Error("Message not found");
    }
    return { ...message };
  }

async getChannelsByType(channelType = 'team') {
    await this.delay(200);
    return this.channels.filter(channel => channel.type === channelType);
  }

  async createChannel(channelData) {
    await this.delay(300);
    const newChannel = {
      Id: this.nextChannelId++,
      name: channelData.name,
      type: channelData.type || 'team',
      projectId: channelData.projectId || null,
      description: channelData.description || '',
      createdAt: new Date().toISOString(),
      memberCount: 1
    };
    this.channels.push(newChannel);
    return newChannel;
  }

  async getMessagesByChannel(projectId = null, channelType = 'team') {
    await this.delay(300);
    const filteredMessages = this.messages
      .filter(message => {
        if (channelType === 'team') {
          return message.channelType === 'team';
        } else if (channelType === 'project' && projectId) {
          return message.channelType === 'project' && message.projectId === parseInt(projectId);
        }
        return false;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Add reactions and thread counts to messages
    return filteredMessages.map(message => ({
      ...message,
      reactions: this.getMessageReactions(message.Id),
      threadCount: this.getThreadCount(message.Id),
      hasThread: this.hasThread(message.Id)
    }));
  }

  async create(messageData) {
    await this.delay(400);
    const newId = this.messages.length > 0 ? Math.max(...this.messages.map(m => m.Id)) + 1 : 1;
    const newMessage = {
      Id: newId,
      content: messageData.content,
      authorId: parseInt(messageData.authorId),
      projectId: messageData.projectId ? parseInt(messageData.projectId) : null,
      channelType: messageData.channelType || 'team',
      parentId: messageData.parentId || null,
      mentions: this.extractMentions(messageData.content),
      attachments: messageData.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.messages.push(newMessage);
    return { ...newMessage };
  }

  async update(id, messageData) {
    await this.delay(400);
    const index = this.messages.findIndex(m => m.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Message not found");
    }
    
    this.messages[index] = {
      ...this.messages[index],
      content: messageData.content,
      mentions: this.extractMentions(messageData.content),
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.messages[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.messages.findIndex(m => m.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Message not found");
    }
    
    this.messages.splice(index, 1);
    return { success: true };
  }

  // Slack-like thread functionality
  async getThreadReplies(parentId) {
    await this.delay(200);
    return this.messages
      .filter(message => message.parentId === parseInt(parentId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(message => ({
        ...message,
        reactions: this.getMessageReactions(message.Id)
      }));
  }
getThreadCount(messageId) {
    return this.messages.filter(m => m.parentId === parseInt(messageId)).length;
  }

  hasThread(messageId) {
    return this.getThreadCount(messageId) > 0;
  }

  async addMemberToChannel(channelId, memberId) {
    await this.delay(200);
    const channel = this.channels.find(c => c.Id === parseInt(channelId));
    if (channel) {
      channel.memberCount = (channel.memberCount || 0) + 1;
      return true;
    }
    return false;
  }
// Emoji reactions
  async addReaction(messageId, emoji, userId) {
    await this.delay(200);
    const reaction = {
      Id: Date.now(),
      messageId: parseInt(messageId),
      emoji,
      userId: parseInt(userId),
      createdAt: new Date().toISOString()
    };
    this.reactions.push(reaction);
    return reaction;
  }

  async removeReaction(messageId, emoji, userId) {
    await this.delay(200);
    const index = this.reactions.findIndex(r => 
      r.messageId === parseInt(messageId) && 
      r.emoji === emoji && 
      r.userId === parseInt(userId)
    );
    if (index !== -1) {
      this.reactions.splice(index, 1);
    }
    return { success: true };
  }

  getMessageReactions(messageId) {
    const messageReactions = this.reactions.filter(r => r.messageId === parseInt(messageId));
    const grouped = {};
    
    messageReactions.forEach(reaction => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: []
        };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.userId);
    });
    
    return Object.values(grouped);
  }

  // Mention extraction
  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  // Search functionality
  async searchMessages(query, channelType = 'team', projectId = null) {
    await this.delay(300);
    const messages = await this.getMessagesByChannel(projectId, channelType);
    return messages.filter(message => 
      message.content.toLowerCase().includes(query.toLowerCase()) ||
      (message.mentions && message.mentions.some(mention => 
        mention.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  // File attachment handling
  async uploadFile(file, messageId) {
    await this.delay(500);
    const attachment = {
      Id: Date.now(),
      messageId: parseInt(messageId),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: URL.createObjectURL(file), // In production, this would be a real URL
      uploadedAt: new Date().toISOString()
    };
    return attachment;
  }
}

export default new ChatService();