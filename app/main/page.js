"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import RightPanel from "./components/RightPanel";

export default function App() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {

  const checkAdminStatus = () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');

      if (adminEmail === 'admin@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
             }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } 
    };

      checkAdminStatus();
    },  []);



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
  // If not admin, redirect to home page
  else {
    useEffect(() => {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 2500); 

      return () => clearTimeout(redirectTimer);
    }, [router]);
    
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
