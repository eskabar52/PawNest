// store/petStore.ts — Hayvan Verileri State Yönetimi
import { create } from 'zustand';
import { Pet } from '../types';

interface PetState {
  pets: Pet[];
  selectedPetId: string | null;
  isLoading: boolean;
  selectedPet: () => Pet | undefined;
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  removePet: (id: string) => void;
  selectPet: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedPetId: null,
  isLoading: false,

  selectedPet: () => {
    const { pets, selectedPetId } = get();
    return pets.find((p) => p.id === selectedPetId);
  },

  setPets: (pets) =>
    set({
      pets,
      selectedPetId: pets.length > 0 ? pets[0].id : null,
    }),

  addPet: (pet) =>
    set((state) => ({
      pets: [...state.pets, pet],
      selectedPetId: state.selectedPetId ?? pet.id,
    })),

  updatePet: (id, updates) =>
    set((state) => ({
      pets: state.pets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removePet: (id) =>
    set((state) => {
      const newPets = state.pets.filter((p) => p.id !== id);
      return {
        pets: newPets,
        selectedPetId:
          state.selectedPetId === id
            ? newPets[0]?.id ?? null
            : state.selectedPetId,
      };
    }),

  selectPet: (id) => set({ selectedPetId: id }),

  setLoading: (isLoading) => set({ isLoading }),
}));
