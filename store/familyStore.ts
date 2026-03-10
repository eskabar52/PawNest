// store/familyStore.ts — Aile State Yönetimi
import { create } from 'zustand';
import { FamilyMember, ActivityLog } from '../services/firebase/family';

interface FamilyState {
  members: FamilyMember[];
  activities: ActivityLog[];
  setMembers: (members: FamilyMember[]) => void;
  addMember: (member: FamilyMember) => void;
  removeMember: (id: string) => void;
  setActivities: (activities: ActivityLog[]) => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  members: [],
  activities: [],

  setMembers: (members) => set({ members }),
  addMember: (member) => set((s) => ({ members: [...s.members, member] })),
  removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),

  setActivities: (activities) => set({ activities }),
}));
