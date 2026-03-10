// services/firebase/care.ts — Bakım Görevleri CRUD Servisi
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { CareTask } from '../../types';

const COLLECTION = 'care_tasks';

// Yeni görev ekle
export async function addCareTask(task: Omit<CareTask, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...task,
    createdAt: new Date(),
  });
  return docRef.id;
}

// Görev güncelle
export async function updateCareTask(
  taskId: string,
  updates: Partial<CareTask>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, taskId), updates);
}

// Görevi tamamla
export async function completeCareTask(
  taskId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, taskId), {
    isCompleted: true,
    completedAt: new Date(),
    completedBy: userId,
  });
}

// Görevi geri al
export async function uncompleteCareTask(taskId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, taskId), {
    isCompleted: false,
    completedAt: null,
    completedBy: null,
  });
}

// Görev sil
export async function deleteCareTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, taskId));
}

// Hayvanın görevlerini getir
export async function getPetCareTasks(petId: string): Promise<CareTask[]> {
  const q = query(
    collection(db, COLLECTION),
    where('petId', '==', petId),
    orderBy('scheduledTime', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CareTask));
}

// Hayvanın görevlerini gerçek zamanlı dinle
export function onPetCareTasksChanged(
  petId: string,
  callback: (tasks: CareTask[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('petId', '==', petId),
    orderBy('scheduledTime', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CareTask));
    callback(tasks);
  });
}

// Varsayılan görev şablonları
export const DEFAULT_CARE_TASKS = {
  dog: [
    { title: 'Sabah maması', icon: '🍽️', frequency: 'daily' as const, scheduledTime: '08:00' },
    { title: 'Akşam maması', icon: '🍽️', frequency: 'daily' as const, scheduledTime: '19:00' },
    { title: 'Yürüyüş', icon: '🦮', frequency: 'daily' as const, scheduledTime: '07:00' },
    { title: 'Su değiştir', icon: '💧', frequency: 'daily' as const, scheduledTime: '09:00' },
    { title: 'Tüy tarama', icon: '🪮', frequency: 'weekly' as const, scheduledTime: '10:00' },
    { title: 'Banyo', icon: '🛁', frequency: 'monthly' as const, scheduledTime: '10:00' },
    { title: 'Tırnak kesimi', icon: '✂️', frequency: 'monthly' as const, scheduledTime: '10:00' },
    { title: 'Diş temizliği', icon: '🦷', frequency: 'weekly' as const, scheduledTime: '20:00' },
  ],
  cat: [
    { title: 'Sabah maması', icon: '🍽️', frequency: 'daily' as const, scheduledTime: '08:00' },
    { title: 'Akşam maması', icon: '🍽️', frequency: 'daily' as const, scheduledTime: '19:00' },
    { title: 'Su değiştir', icon: '💧', frequency: 'daily' as const, scheduledTime: '09:00' },
    { title: 'Kum temizliği', icon: '🧹', frequency: 'daily' as const, scheduledTime: '20:00' },
    { title: 'Tüy tarama', icon: '🪮', frequency: 'weekly' as const, scheduledTime: '10:00' },
    { title: 'Tırnak kontrolü', icon: '✂️', frequency: 'monthly' as const, scheduledTime: '10:00' },
  ],
  rabbit: [
    { title: 'Sabah yemi', icon: '🥬', frequency: 'daily' as const, scheduledTime: '08:00' },
    { title: 'Akşam yemi', icon: '🥕', frequency: 'daily' as const, scheduledTime: '18:00' },
    { title: 'Su değiştir', icon: '💧', frequency: 'daily' as const, scheduledTime: '09:00' },
    { title: 'Kafes temizliği', icon: '🧹', frequency: 'weekly' as const, scheduledTime: '10:00' },
    { title: 'Tırnak kontrolü', icon: '✂️', frequency: 'monthly' as const, scheduledTime: '10:00' },
  ],
  hamster: [
    { title: 'Yem ver', icon: '🌻', frequency: 'daily' as const, scheduledTime: '08:00' },
    { title: 'Su değiştir', icon: '💧', frequency: 'daily' as const, scheduledTime: '09:00' },
    { title: 'Kafes temizliği', icon: '🧹', frequency: 'weekly' as const, scheduledTime: '10:00' },
  ],
  bird: [
    { title: 'Yem ver', icon: '🌾', frequency: 'daily' as const, scheduledTime: '08:00' },
    { title: 'Su değiştir', icon: '💧', frequency: 'daily' as const, scheduledTime: '09:00' },
    { title: 'Kafes temizliği', icon: '🧹', frequency: 'weekly' as const, scheduledTime: '10:00' },
  ],
  other: [
    { title: 'Yem ver', icon: '🍽️', frequency: 'daily' as const, scheduledTime: '08:00' },
    { title: 'Su değiştir', icon: '💧', frequency: 'daily' as const, scheduledTime: '09:00' },
  ],
};
