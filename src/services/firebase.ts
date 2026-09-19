import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9ITYb-GXhDEgB5BaQ4YiiTn-1d4ltQp4",
  authDomain: "lilsongu.firebaseapp.com",
  projectId: "lilsongu",
  storageBucket: "lilsongu.firebasestorage.app",
  messagingSenderId: "933666294224",
  appId: "1:933666294224:web:e77e6ac2f31be5672e11d5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);