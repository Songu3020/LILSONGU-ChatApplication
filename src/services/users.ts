import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "../types";

export async function createUserIfNotExists(
  userId: string,
  phoneNumber: string,
): Promise<void> {
  const userRef = doc(db, "users", userId);
  const existingUser = await getDoc(userRef);

  if (existingUser.exists()) {
    return;
  }

  const newUser: User = {
    id: userId,
    phoneNumber,
    displayName: phoneNumber,
  };

  await setDoc(userRef, newUser);
}

export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  return userSnapshot.data() as User;
}

export async function getUserByPhoneNumber(
  phoneNumber: string,
): Promise<User | null> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("phoneNumber", "==", phoneNumber));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

export async function setUserOnlineStatus(
  userId: string,
  isOnline: boolean,
): Promise<void> {
  const userRef = doc(db, "users", userId);
  
  if (isOnline) {
    await setDoc(userRef, { isOnline: true }, { merge: true });
  } else {
    await setDoc(
      userRef,
      { isOnline: false, lastSeen: Date.now() },
      { merge: true },
    );
  }
}
