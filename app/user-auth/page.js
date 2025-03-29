'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserAuth() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 2500);

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access.
        </p>
        <p className="text-gray-500 mb-6">
          You will be redirected to the home page.
        </p>
        <Link 
          href="/"
          className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
