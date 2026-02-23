"use client";


// Controls what the UI shows based on the user's role. 


import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Context holds both the Firebase Auth user and their Firestore profile (which has the role)
const AuthContext = createContext({ user: null, userProfile: null, loading: true });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);           // Firebase Auth user object
    const [userProfile, setUserProfile] = useState(null); // Firestore user doc (has role, name, etc.)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for authentication state changes (login, logout, session refresh)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch the user's Firestore document to get their role and profile data
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                setUserProfile(userDoc.exists() ? userDoc.data() : null);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// useAuth() gives any component access to: user, userProfile (with role), and loading state
export const useAuth = () => useContext(AuthContext);