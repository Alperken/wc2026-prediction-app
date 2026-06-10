import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBaJaoWC3u3VPdXaPQPh8zXXl4kFbFNrCc",
  authDomain: "worldcup2026-bd9ba.firebaseapp.com",
  projectId: "worldcup2026-bd9ba",
  storageBucket: "worldcup2026-bd9ba.firebasestorage.app",
  messagingSenderId: "843920076541",
  appId: "1:843920076541:web:7ed5ce88f86fd6037c1894"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
