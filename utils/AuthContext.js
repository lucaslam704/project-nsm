"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, loginUser, registerUser, logoutUser, resetPassword } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password) => {
    return registerUser(email, password);
  };

  // Login function
  const login = async (email, password) => {
    return loginUser(email, password);
  };

  // Logout function
  const logout = async () => {
    return logoutUser();
  };

  // Password reset function
  const forgotPassword = async (email) => {
    return resetPassword(email);
  };

  // Set up an observer for changes to the user's sign-in state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up the observer when the component unmounts
    return unsubscribe;
  }, []);

  // The value that will be supplied to any consuming components
  const value = {
    currentUser,
    login,
    signup,
    logout,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
