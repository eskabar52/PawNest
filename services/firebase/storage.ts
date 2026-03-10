// services/firebase/storage.ts — Fotoğraf Yükleme Servisi
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase.config';

// Fotoğraf yükle ve URL döndür
export async function uploadPhoto(
  uri: string,
  path: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  return await getDownloadURL(storageRef);
}

// Hayvan profil fotoğrafı yükle
export async function uploadPetPhoto(
  uri: string,
  petId: string
): Promise<string> {
  const filename = `pets/${petId}/profile_${Date.now()}.jpg`;
  return uploadPhoto(uri, filename);
}

// Genel fotoğraf yükle (albüm vb.)
export async function uploadMemoryPhoto(
  uri: string,
  petId: string
): Promise<string> {
  const filename = `pets/${petId}/memories/${Date.now()}.jpg`;
  return uploadPhoto(uri, filename);
}
