import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (profileUnsub) profileUnsub();

      if (firebaseUser) {
        setUser(firebaseUser);
        // Realtime profile listener
        profileUnsub = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const updateAvatar = async (avatarId) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { avatarId });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
