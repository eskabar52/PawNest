// services/firebase/health.ts — Sağlık CRUD Servisi
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
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { HealthRecord, Symptom, Medication } from '../../types';

// === SAĞLIK KAYITLARI ===

export async function addHealthRecord(record: Omit<HealthRecord, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'health_records'), {
    ...record,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateHealthRecord(id: string, updates: Partial<HealthRecord>): Promise<void> {
  await updateDoc(doc(db, 'health_records', id), updates);
}

export async function deleteHealthRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, 'health_records', id));
}

export function onPetHealthRecordsChanged(
  petId: string,
  callback: (records: HealthRecord[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'health_records'),
    where('petId', '==', petId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HealthRecord)));
  });
}

// === SEMPTOMLAR ===

export async function addSymptom(symptom: Omit<Symptom, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'symptoms'), {
    ...symptom,
    createdAt: new Date(),
  });
  return docRef.id;
}

export function onPetSymptomsChanged(
  petId: string,
  callback: (symptoms: Symptom[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'symptoms'),
    where('petId', '==', petId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Symptom)));
  });
}

// === İLAÇLAR ===

export async function addMedication(med: Omit<Medication, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'medications'), { ...med });
  return docRef.id;
}

export async function updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
  await updateDoc(doc(db, 'medications', id), updates);
}

export async function deleteMedication(id: string): Promise<void> {
  await deleteDoc(doc(db, 'medications', id));
}

export function onPetMedicationsChanged(
  petId: string,
  callback: (meds: Medication[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'medications'),
    where('petId', '==', petId),
    where('isActive', '==', true)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Medication)));
  });
}

// === SEMPTOM LİSTESİ (Seçimli) ===

export const SYMPTOM_OPTIONS = [
  { key: 'vomiting', label: 'Kusma', icon: '🤮' },
  { key: 'diarrhea', label: 'İshal', icon: '💩' },
  { key: 'lethargy', label: 'Halsizlik', icon: '😴' },
  { key: 'loss_appetite', label: 'İştahsızlık', icon: '🍽️' },
  { key: 'coughing', label: 'Öksürük', icon: '😷' },
  { key: 'sneezing', label: 'Hapşırma', icon: '🤧' },
  { key: 'itching', label: 'Kaşıntı', icon: '🐾' },
  { key: 'limping', label: 'Topallama', icon: '🦿' },
  { key: 'excessive_thirst', label: 'Aşırı su içme', icon: '💧' },
  { key: 'hair_loss', label: 'Tüy dökülmesi', icon: '🪮' },
  { key: 'eye_discharge', label: 'Göz akıntısı', icon: '👁️' },
  { key: 'ear_odor', label: 'Kulak kokusu', icon: '👂' },
  { key: 'weight_loss', label: 'Kilo kaybı', icon: '⬇️' },
  { key: 'weight_gain', label: 'Kilo artışı', icon: '⬆️' },
  { key: 'breathing_difficulty', label: 'Nefes darlığı', icon: '😮‍💨' },
];
