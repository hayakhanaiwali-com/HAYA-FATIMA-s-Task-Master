import { Task } from "../types";

const STORAGE_KEY_TASKS = 'taskmaster_tasks';

export const StorageService = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }
};