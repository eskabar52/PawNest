// types/index.ts — TypeScript Tip Tanımları

export type PetType = 'dog' | 'cat' | 'rabbit' | 'hamster' | 'bird' | 'other';
export type Gender = 'male' | 'female';
export type PlanType = 'free' | 'premium' | 'breeder';
export type CareFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type HealthRecordType = 'checkup' | 'vaccine' | 'medication' | 'surgery' | 'other';
export type PregnancyStatus = 'active' | 'completed' | 'lost';

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  plan: PlanType;
  createdAt: Date;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  type: PetType;
  breed: string;
  gender: Gender;
  birthDate: Date;
  color: string;
  weight: number;
  isNeutered: boolean;
  profilePhoto?: string;
  themeColor?: string;
  familyMembers: string[];
  createdAt: Date;
}

export interface CareTask {
  id: string;
  petId: string;
  title: string;
  icon: string;
  frequency: CareFrequency;
  scheduledTime: string;
  scheduledDay?: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  isCustom: boolean;
  createdAt: Date;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthRecordType;
  title: string;
  date: Date;
  vetName?: string;
  notes?: string;
  cost?: number;
  attachments: string[];
  createdAt: Date;
}

export interface Symptom {
  id: string;
  petId: string;
  symptoms: string[];
  notes?: string;
  date: Date;
  aiWarning: boolean;
  createdAt: Date;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date;
  reminderTime: string;
  isActive: boolean;
}

export interface Photo {
  id: string;
  petId: string;
  url: string;
  caption?: string;
  isMilestone: boolean;
  milestoneType?: string;
  takenAt: Date;
  uploadedBy: string;
}

export interface BreedingCycle {
  id: string;
  petId: string;
  startDate: Date;
  endDate?: Date;
  symptoms: string[];
  notes?: string;
  createdAt: Date;
}

export interface Pregnancy {
  id: string;
  petId: string;
  matingDate: Date;
  partnerName?: string;
  partnerBreed?: string;
  expectedDueDate: Date;
  actualDueDate?: Date;
  status: PregnancyStatus;
  weeklyNotes: Record<number, string>;
  photos: string[];
  createdAt: Date;
}

export interface Litter {
  id: string;
  pregnancyId: string;
  petId: string;
  birthDate: Date;
  totalCount: number;
  puppies: Puppy[];
}

export interface Puppy {
  id: string;
  gender: Gender;
  color: string;
  birthWeight: number;
  currentWeight: number;
  isAlive: boolean;
  nickname?: string;
  photos: string[];
  weightHistory: WeightRecord[];
  vaccinations: HealthRecord[];
  adoptedBy?: string;
  adoptedDate?: Date;
  notes?: string;
}

export interface WeightRecord {
  date: Date;
  weight: number;
  note?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
