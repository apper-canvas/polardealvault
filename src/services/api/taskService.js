import mockTasks from "@/services/mockData/tasks.json";

let tasks = [...mockTasks];
let nextId = Math.max(...tasks.map(task => task.Id)) + 1;

const taskService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...tasks]);
      }, 200);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const task = tasks.find(t => t.Id === parseInt(id));
        if (task) {
          resolve({ ...task });
        } else {
          reject(new Error("Task not found"));
        }
      }, 100);
    });
  },

create: (taskData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask = {
          ...taskData,
          Id: nextId++,
          createdAt: new Date().toISOString(),
          completed: false,
          priority: taskData.priority || "Medium",
          dueDate: taskData.dueDate || null,
          startDate: taskData.startDate || new Date().toISOString(),
          dependencies: taskData.dependencies || [],
          progress: taskData.progress || 0,
          estimatedHours: taskData.estimatedHours || 0,
          actualHours: taskData.actualHours || 0
        };
        tasks.push(newTask);
        resolve({ ...newTask });
      }, 300);
    });
  },

update: (id, taskData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          const updatedTask = { 
            ...tasks[index], 
            ...taskData,
            updatedAt: new Date().toISOString()
          };
          
          // Validate dependencies to prevent circular references
          if (taskData.dependencies) {
            const validateDependencies = (taskId, deps, visited = new Set()) => {
              if (visited.has(taskId)) return false;
              visited.add(taskId);
              
              for (const depId of deps) {
                const depTask = tasks.find(t => t.Id === depId);
                if (depTask && depTask.dependencies) {
                  if (!validateDependencies(depId, depTask.dependencies, visited)) {
                    return false;
                  }
                }
              }
              return true;
            };
            
            if (!validateDependencies(parseInt(id), taskData.dependencies)) {
              reject(new Error("Circular dependency detected"));
              return;
            }
          }
          
          tasks[index] = updatedTask;
          resolve({ ...updatedTask });
        } else {
          reject(new Error("Task not found"));
        }
      }, 300);
    });
  },

  updateStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          const updatedTask = { 
            ...tasks[index], 
            status: status,
            completed: status === 'completed',
            updatedAt: new Date().toISOString()
          };
          
          tasks[index] = updatedTask;
          resolve({ ...updatedTask });
        } else {
          reject(new Error("Task not found"));
        }
      }, 200);
    });
  },

delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          tasks.splice(index, 1);
          resolve();
        } else {
          reject(new Error("Task not found"));
        }
      }, 200);
    });
  },

getByProjectId: (projectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projectTasks = tasks.filter(task => task.projectId === parseInt(projectId));
        resolve([...projectTasks]);
      }, 200);
    });
  },

  markComplete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          tasks[index] = { 
            ...tasks[index], 
            completed: true,
            completedAt: new Date().toISOString()
          };
          resolve({ ...tasks[index] });
        } else {
          reject(new Error("Task not found"));
        }
      }, 300);
    });
}
};

// Import activity service to track task activities
import activityService from './activityService.js';

// Override create method to track activity
const originalCreate = taskService.create;
taskService.create = async (taskData) => {
  const newTask = await originalCreate(taskData);
  
  // Track task creation activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.TASK_CREATED,
    userId: taskData.assignedTo || 1, // Default to user 1 if no assignee
    projectId: taskData.projectId,
    taskId: newTask.Id,
    description: `created task "${newTask.name}"${taskData.projectId ? '' : ' in project'}`
  });
  
  return newTask;
};

// Override update method to track activity
const originalUpdate = taskService.update;
taskService.update = async (id, taskData) => {
  const updatedTask = await originalUpdate(id, taskData);
  
  // Track task update activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.TASK_UPDATED,
    userId: taskData.assignedTo || updatedTask.assignedTo || 1,
    projectId: updatedTask.projectId,
    taskId: updatedTask.Id,
    description: `updated task "${updatedTask.name}"`
  });
  
  return updatedTask;
};

// Override delete method to track activity
const originalDelete = taskService.delete;
taskService.delete = async (id) => {
  const task = await taskService.getById(id);
  await originalDelete(id);
  
  // Track task deletion activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.TASK_DELETED,
    userId: task.assignedTo || 1,
    projectId: task.projectId,
    taskId: task.Id,
    description: `deleted task "${task.name}"`
  });
};

// Override markComplete method to track activity
const originalMarkComplete = taskService.markComplete;
taskService.markComplete = async (id) => {
  const completedTask = await originalMarkComplete(id);
  
  // Track task completion activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.TASK_COMPLETED,
    userId: completedTask.assignedTo || 1,
    projectId: completedTask.projectId,
    taskId: completedTask.Id,
    description: `completed task "${completedTask.name}"`
  });
  
  return completedTask;
};

export default taskService;