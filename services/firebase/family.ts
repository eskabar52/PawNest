// services/firebase/family.ts — Aile Yönetimi Servisi
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase.config';

export interface FamilyMember {
  id: string;
  petId: string;
  userId: string;
  displayName: string;
  email: string;
  role: 'owner' | 'caretaker' | 'viewer';
  joinedAt: Date;
}

export interface ActivityLog {
  id: string;
  petId: string;
  userId: string;
  userName: string;
  action: string;
  detail?: string;
  timestamp: Date;
}

// === AİLE ÜYELERİ ===

export async function addFamilyMember(member: Omit<FamilyMember, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'family_members'), {
    ...member,
    joinedAt: new Date(),
  });
  return docRef.id;
}

export async function updateFamilyMemberRole(id: string, role: FamilyMember['role']): Promise<void> {
  await updateDoc(doc(db, 'family_members', id), { role });
}

export async function removeFamilyMember(id: string): Promise<void> {
  await deleteDoc(doc(db, 'family_members', id));
}

export function onPetFamilyChanged(
  petId: string,
  callback: (members: FamilyMember[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'family_members'),
    where('petId', '==', petId)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyMember)));
  });
}

// === AKTİVİTE AKIŞI ===

export async function logActivity(log: Omit<ActivityLog, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'activity_logs'), {
    ...log,
    timestamp: new Date(),
  });
  return docRef.id;
}

export function onPetActivityChanged(
  petId: string,
  callback: (logs: ActivityLog[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'activity_logs'),
    where('petId', '==', petId)
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ActivityLog))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(logs.slice(0, 20));
  });
}
