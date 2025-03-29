"use client";

import { useRouter } from "next/navigation";
import  Link from "next/link";

export default function Sidebar() {

const router = useRouter();

    return (
      <div className="w-1/5 bg-white p-5 shadow-lg">
        <h2 className="text-xl font-bold mb-5">Dashboard</h2>
        <ul>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Home</li>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Messages</li>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Notifications</li>
          <li className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Profile</li>
        </ul>
      
          <div>
            <Link
            onClick={() => localStorage.removeItem('adminEmail')}
            href="/"
            className="mb-4 text-gray-700 hover:text-blue-500 cursor-pointer">Log Out</Link>
          </div>
      </div>
    );
  }