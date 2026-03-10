// store/memoriesStore.ts — Anılar State Yönetimi
import { create } from 'zustand';
import { Photo, Milestone } from '../types';

interface MemoriesState {
  photos: Photo[];
  milestones: Milestone[];
  viewMode: 'grid' | 'timeline';
  setPhotos: (photos: Photo[]) => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (id: string) => void;
  setMilestones: (milestones: Milestone[]) => void;
  addMilestone: (milestone: Milestone) => void;
  removeMilestone: (id: string) => void;
  setViewMode: (mode: 'grid' | 'timeline') => void;
}

export const useMemoriesStore = create<MemoriesState>((set) => ({
  photos: [],
  milestones: [],
  viewMode: 'grid',

  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) => set((s) => ({ photos: [photo, ...s.photos] })),
  removePhoto: (id) => set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

  setMilestones: (milestones) => set({ milestones }),
  addMilestone: (milestone) => set((s) => ({ milestones: [milestone, ...s.milestones] })),
  removeMilestone: (id) => set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),

  setViewMode: (viewMode) => set({ viewMode }),
}));
