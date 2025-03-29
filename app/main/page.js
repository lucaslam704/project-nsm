"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import RightPanel from "./components/RightPanel";

export default function App() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
          const adminEmail = localStorage.getItem('adminEmail');
          setIsAdmin(adminEmail === 'admin@gmail.com');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Handle redirect for non-admin users
  useEffect(() => {
    // Only set up redirect if not loading and not admin
    if (!loading && !isAdmin) {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 2500);

      return () => clearTimeout(redirectTimer);
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <Feed />
        <RightPanel />
      </div>
    );
  } 
  // If not admin, show access denied message
  else {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This server is only available for administrators.
          </p>
          <p className="text-gray-500 mb-6">
            You will be redirected to the home page.
          </p>
        </div>
      </div>
    );
  }
}
