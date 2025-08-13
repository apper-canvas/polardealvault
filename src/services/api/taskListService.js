import taskListsData from "@/services/mockData/taskLists.json";

class TaskListService {
  constructor() {
    this.taskLists = [...taskListsData];
  }

  async getAll() {
    await this.delay(200);
    return [...this.taskLists];
  }

  async getById(id) {
    await this.delay(100);
    const taskList = this.taskLists.find(tl => tl.Id === parseInt(id));
    if (!taskList) {
      throw new Error("Task list not found");
    }
    return { ...taskList };
  }

  async create(taskListData) {
    await this.delay(400);
    const newId = this.taskLists.length > 0 ? Math.max(...this.taskLists.map(tl => tl.Id)) + 1 : 1;
    const newTaskList = {
      Id: newId,
      ...taskListData,
      milestoneId: parseInt(taskListData.milestoneId),
      projectId: parseInt(taskListData.projectId),
      tasks: [],
      createdAt: new Date().toISOString()
    };

    this.taskLists.push(newTaskList);
    return { ...newTaskList };
  }

  async update(id, taskListData) {
    await this.delay(300);
    const index = this.taskLists.findIndex(tl => tl.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task list not found");
    }

    const updatedTaskList = {
      ...this.taskLists[index],
      ...taskListData,
      milestoneId: parseInt(taskListData.milestoneId),
      projectId: parseInt(taskListData.projectId),
      updatedAt: new Date().toISOString()
    };

    this.taskLists[index] = updatedTaskList;
    return { ...updatedTaskList };
  }

  async delete(id) {
    await this.delay(200);
    const index = this.taskLists.findIndex(tl => tl.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Task list not found");
    }

    this.taskLists.splice(index, 1);
    return true;
  }

  async getByMilestoneId(milestoneId) {
    await this.delay(200);
    const taskLists = this.taskLists.filter(tl => tl.milestoneId === parseInt(milestoneId));
    return [...taskLists];
  }

  async getByProjectId(projectId) {
    await this.delay(200);
    const taskLists = this.taskLists.filter(tl => tl.projectId === parseInt(projectId));
    return [...taskLists];
  }

  async addTaskToList(taskListId, taskId) {
    await this.delay(200);
    const index = this.taskLists.findIndex(tl => tl.Id === parseInt(taskListId));
    if (index === -1) {
      throw new Error("Task list not found");
    }

    if (!this.taskLists[index].tasks.includes(parseInt(taskId))) {
      this.taskLists[index].tasks.push(parseInt(taskId));
    }

    return { ...this.taskLists[index] };
  }

  async removeTaskFromList(taskListId, taskId) {
    await this.delay(200);
    const index = this.taskLists.findIndex(tl => tl.Id === parseInt(taskListId));
    if (index === -1) {
      throw new Error("Task list not found");
    }

    this.taskLists[index].tasks = this.taskLists[index].tasks.filter(id => id !== parseInt(taskId));
    return { ...this.taskLists[index] };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TaskListService();