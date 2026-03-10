// services/firebase/breeding.ts — Üreme & Gebelik CRUD Servisi
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { BreedingCycle, Pregnancy, Litter } from '../../types';

// === KIZGINLIK DÖNGÜLERİ ===

export async function addBreedingCycle(cycle: Omit<BreedingCycle, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'breeding_cycles'), {
    ...cycle,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateBreedingCycle(id: string, updates: Partial<BreedingCycle>): Promise<void> {
  await updateDoc(doc(db, 'breeding_cycles', id), updates);
}

export async function deleteBreedingCycle(id: string): Promise<void> {
  await deleteDoc(doc(db, 'breeding_cycles', id));
}

export function onPetBreedingCyclesChanged(
  petId: string,
  callback: (cycles: BreedingCycle[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'breeding_cycles'),
    where('petId', '==', petId),
    orderBy('startDate', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BreedingCycle)));
  });
}

// === GEBELİKLER ===

export async function addPregnancy(pregnancy: Omit<Pregnancy, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'pregnancies'), {
    ...pregnancy,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updatePregnancy(id: string, updates: Partial<Pregnancy>): Promise<void> {
  await updateDoc(doc(db, 'pregnancies', id), updates);
}

export async function deletePregnancy(id: string): Promise<void> {
  await deleteDoc(doc(db, 'pregnancies', id));
}

export function onPetPregnanciesChanged(
  petId: string,
  callback: (pregnancies: Pregnancy[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'pregnancies'),
    where('petId', '==', petId),
    orderBy('matingDate', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pregnancy)));
  });
}

// === YAVRULAR ===

export async function addLitter(litter: Omit<Litter, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'litters'), { ...litter });
  return docRef.id;
}

export async function updateLitter(id: string, updates: Partial<Litter>): Promise<void> {
  await updateDoc(doc(db, 'litters', id), updates);
}

export function onPetLittersChanged(
  petId: string,
  callback: (litters: Litter[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'litters'),
    where('petId', '==', petId),
    orderBy('birthDate', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Litter)));
  });
}

// === GEBELİK SÜRESİ BİLGİLERİ ===

export const GESTATION_PERIODS: Record<string, number> = {
  dog: 63,    // ~63 gün
  cat: 65,    // ~63-67 gün
  rabbit: 31, // ~28-35 gün
  hamster: 16,// ~15-18 gün
  other: 60,
};

export const HEAT_CYCLE_INFO: Record<string, { interval: string; duration: string }> = {
  dog: { interval: '6-8 ay', duration: '2-3 hafta' },
  cat: { interval: '2-3 hafta (mevsimsel)', duration: '4-10 gün' },
  rabbit: { interval: 'Sürekli (indüksiyonlu)', duration: 'Sürekli' },
};
