// services/firebase/auth.ts — Firebase Auth Servisi
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { User } from '../../types';

// Kayıt ol
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const user: User = {
    id: credential.user.uid,
    displayName,
    email,
    plan: 'free',
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), user);
  return user;
}

// Giriş yap
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return await getUserProfile(credential.user.uid);
}

// Çıkış yap
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Kullanıcı profilini getir
export async function getUserProfile(uid: string): Promise<User> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }

  throw new Error('Kullanıcı profili bulunamadı');
}

// Auth durumu dinle
export function onAuthChanged(
  callback: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
