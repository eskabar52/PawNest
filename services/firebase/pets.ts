// services/firebase/pets.ts — Hayvan CRUD Servisi
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Pet } from '../../types';

const COLLECTION = 'pets';

// Yeni hayvan ekle
export async function addPet(pet: Omit<Pet, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...pet,
    createdAt: new Date(),
  });
  return docRef.id;
}

// Hayvan güncelle
export async function updatePet(
  petId: string,
  updates: Partial<Pet>
): Promise<void> {
  const docRef = doc(db, COLLECTION, petId);
  await updateDoc(docRef, updates);
}

// Hayvan sil
export async function deletePet(petId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, petId));
}

// Tek hayvan getir
export async function getPet(petId: string): Promise<Pet> {
  const docSnap = await getDoc(doc(db, COLLECTION, petId));
  if (!docSnap.exists()) throw new Error('Hayvan bulunamadı');
  return { id: docSnap.id, ...docSnap.data() } as Pet;
}

// Kullanıcının hayvanlarını getir
export async function getUserPets(userId: string): Promise<Pet[]> {
  const q = query(
    collection(db, COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pet));
}

// Kullanıcının hayvanlarını gerçek zamanlı dinle
export function onUserPetsChanged(
  userId: string,
  callback: (pets: Pet[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const pets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Pet));
    callback(pets);
  });
}
