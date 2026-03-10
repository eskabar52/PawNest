// services/firebase/chat.ts — Chat Mesaj Geçmişi CRUD Servisi
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { ChatMessage } from '../../types';

const COLLECTION = 'chat_messages';

export async function saveChatMessage(
  userId: string,
  petId: string,
  message: ChatMessage
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    userId,
    petId,
    ...message,
  });
  return docRef.id;
}

export function onChatMessagesChanged(
  userId: string,
  petId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit = 50
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('petId', '==', petId),
    orderBy('timestamp', 'asc'),
    limit(messageLimit)
  );
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((d) => ({
        role: d.data().role,
        content: d.data().content,
        timestamp: d.data().timestamp?.toDate?.() || new Date(d.data().timestamp),
      }))
    );
  });
}

export async function clearChatHistory(userId: string, petId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('petId', '==', petId)
  );
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id)));
  await Promise.all(deletePromises);
}
