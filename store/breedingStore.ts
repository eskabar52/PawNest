// store/breedingStore.ts — Üreme State Yönetimi
import { create } from 'zustand';
import { BreedingCycle, Pregnancy, Litter } from '../types';

interface BreedingState {
  cycles: BreedingCycle[];
  pregnancies: Pregnancy[];
  litters: Litter[];
  setCycles: (cycles: BreedingCycle[]) => void;
  addCycle: (cycle: BreedingCycle) => void;
  removeCycle: (id: string) => void;
  setPregnancies: (pregnancies: Pregnancy[]) => void;
  addPregnancy: (pregnancy: Pregnancy) => void;
  updatePregnancy: (id: string, updates: Partial<Pregnancy>) => void;
  setLitters: (litters: Litter[]) => void;
  addLitter: (litter: Litter) => void;
}

export const useBreedingStore = create<BreedingState>((set) => ({
  cycles: [],
  pregnancies: [],
  litters: [],

  setCycles: (cycles) => set({ cycles }),
  addCycle: (cycle) => set((s) => ({ cycles: [cycle, ...s.cycles] })),
  removeCycle: (id) => set((s) => ({ cycles: s.cycles.filter((c) => c.id !== id) })),

  setPregnancies: (pregnancies) => set({ pregnancies }),
  addPregnancy: (pregnancy) => set((s) => ({ pregnancies: [pregnancy, ...s.pregnancies] })),
  updatePregnancy: (id, updates) =>
    set((s) => ({
      pregnancies: s.pregnancies.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  setLitters: (litters) => set({ litters }),
  addLitter: (litter) => set((s) => ({ litters: [litter, ...s.litters] })),
}));
