// store/healthStore.ts — Sağlık Verileri State Yönetimi
import { create } from 'zustand';
import { HealthRecord, Symptom, Medication } from '../types';

interface HealthState {
  records: HealthRecord[];
  symptoms: Symptom[];
  medications: Medication[];
  setRecords: (records: HealthRecord[]) => void;
  addRecord: (record: HealthRecord) => void;
  removeRecord: (id: string) => void;
  setSymptoms: (symptoms: Symptom[]) => void;
  addSymptom: (symptom: Symptom) => void;
  setMedications: (medications: Medication[]) => void;
  addMedication: (medication: Medication) => void;
  removeMedication: (id: string) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  records: [],
  symptoms: [],
  medications: [],

  setRecords: (records) => set({ records }),
  addRecord: (record) => set((s) => ({ records: [record, ...s.records] })),
  removeRecord: (id) => set((s) => ({ records: s.records.filter((r) => r.id !== id) })),

  setSymptoms: (symptoms) => set({ symptoms }),
  addSymptom: (symptom) => set((s) => ({ symptoms: [symptom, ...s.symptoms] })),

  setMedications: (medications) => set({ medications }),
  addMedication: (medication) => set((s) => ({ medications: [...s.medications, medication] })),
  removeMedication: (id) => set((s) => ({ medications: s.medications.filter((m) => m.id !== id) })),
}));
