import clientsData from "@/services/mockData/clients.json";

class ClientService {
  constructor() {
this.clients = Array.isArray(clientsData) ? [...clientsData] : [];
  }

  async getAll() {
    await this.delay(300);
    return [...this.clients];
  }

async getById(id) {
    if (!id) {
      throw new Error("Client ID is required");
    }
    
    await this.delay(200);
    const client = this.clients.find(c => c && c.Id === parseInt(id));
    if (!client) {
      throw new Error("Client not found");
    }
    
    return { ...client };
  }

  async getProjectsByClientId(clientId) {
    await this.delay(300);
    // Import projectService to get projects for this client
    const projectService = (await import("./projectService.js")).default;
    const allProjects = await projectService.getAll();
    return allProjects.filter(project => project.clientId === parseInt(clientId));
  }

async create(clientData) {
    await this.delay(400);
    const newId = this.clients.length > 0 ? Math.max(...this.clients.map(c => c.Id)) + 1 : 1;
    const newClient = {
      Id: newId,
      ...clientData,
      status: clientData.status || "Active",
      createdAt: new Date().toISOString()
    };
    this.clients.push(newClient);
    return { ...newClient };
  }

async update(id, clientData) {
    await this.delay(400);
    const index = this.clients.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Client not found");
    }
    
    this.clients[index] = {
      ...this.clients[index],
      ...clientData,
      status: clientData.status || this.clients[index].status || "Active"
    };
    
    return { ...this.clients[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.clients.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Client not found");
    }
    
    this.clients.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ClientService();