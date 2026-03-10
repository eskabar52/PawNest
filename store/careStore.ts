// store/careStore.ts — Bakım Görevleri State Yönetimi
import { create } from 'zustand';
import { CareTask, CareFrequency } from '../types';

interface CareState {
  tasks: CareTask[];
  activeTab: CareFrequency;
  streak: number;
  setTasks: (tasks: CareTask[]) => void;
  addTask: (task: CareTask) => void;
  updateTask: (id: string, updates: Partial<CareTask>) => void;
  removeTask: (id: string) => void;
  setActiveTab: (tab: CareFrequency) => void;
  getFilteredTasks: () => CareTask[];
  getCompletionRate: () => number;
  getDailyStreak: () => number;
}

export const useCareStore = create<CareState>((set, get) => ({
  tasks: [],
  activeTab: 'daily',
  streak: 0,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  setActiveTab: (activeTab) => set({ activeTab }),

  getFilteredTasks: () => {
    const { tasks, activeTab } = get();
    return tasks.filter((t) => t.frequency === activeTab);
  },

  getCompletionRate: () => {
    const { tasks, activeTab } = get();
    const filtered = tasks.filter((t) => t.frequency === activeTab);
    if (filtered.length === 0) return 0;
    const completed = filtered.filter((t) => t.isCompleted).length;
    return Math.round((completed / filtered.length) * 100);
  },

  getDailyStreak: () => {
    const { tasks } = get();
    const dailyTasks = tasks.filter((t) => t.frequency === 'daily');
    if (dailyTasks.length === 0) return 0;
    const allCompleted = dailyTasks.every((t) => t.isCompleted);
    return allCompleted ? get().streak + 1 : get().streak;
  },
}));
