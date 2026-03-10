// services/firebase/photos.ts — Fotoğraf & Anılar CRUD Servisi
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase.config';
import { Photo, Milestone } from '../../types';

// === FOTOĞRAFLAR ===

export async function uploadPhoto(
  petId: string,
  userId: string,
  uri: string,
  caption?: string,
  isMilestone = false,
  milestoneType?: string
): Promise<string> {
  // Fotoğrafı Storage'a yükle
  const filename = `photos/${petId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);
  const response = await fetch(uri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);

  // Firestore'a kaydet
  const docRef = await addDoc(collection(db, 'photos'), {
    petId,
    url,
    caption: caption || '',
    isMilestone,
    milestoneType: milestoneType || null,
    takenAt: new Date(),
    uploadedBy: userId,
    createdAt: new Date(),
  });

  return docRef.id;
}

export async function deletePhoto(photoId: string, photoUrl: string): Promise<void> {
  await deleteDoc(doc(db, 'photos', photoId));
  try {
    const storageRef = ref(storage, photoUrl);
    await deleteObject(storageRef);
  } catch {
    // Dosya bulunamadıysa devam et
  }
}

export function onPetPhotosChanged(
  petId: string,
  callback: (photos: Photo[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'photos'),
    where('petId', '==', petId),
    orderBy('takenAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Photo)));
  });
}

// === KİLOMETRE TAŞLARI ===

export async function addMilestone(milestone: Omit<Milestone, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'milestones'), {
    ...milestone,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function deleteMilestone(id: string): Promise<void> {
  await deleteDoc(doc(db, 'milestones', id));
}

export function onPetMilestonesChanged(
  petId: string,
  callback: (milestones: Milestone[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'milestones'),
    where('petId', '==', petId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Milestone)));
  });
}

// === KİLOMETRE TAŞI ŞABLONLARI ===

export const MILESTONE_TEMPLATES = [
  { type: 'adoption' as const, title: 'Eve geldiği gün', icon: '🏠' },
  { type: 'first_walk' as const, title: 'İlk yürüyüş', icon: '🦮' },
  { type: 'first_bath' as const, title: 'İlk banyo', icon: '🛁' },
  { type: 'first_trick' as const, title: 'İlk hüner', icon: '🎯' },
  { type: 'birthday' as const, title: 'Doğum günü', icon: '🎂' },
  { type: 'graduation' as const, title: 'Eğitim mezuniyeti', icon: '🎓' },
  { type: 'travel' as const, title: 'İlk seyahat', icon: '✈️' },
  { type: 'custom' as const, title: 'Özel an', icon: '⭐' },
];
