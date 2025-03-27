import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-blue-50 to-gray-100">
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-md w-full">
        <title>Not Social Media</title>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 text-blue-800">Welcome to NSM</h1>
          <p className="text-gray-600">Spend your time simply and joyfully with everybody.</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-8 w-full border border-gray-200">
          <form className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <Link href="user-auth/register" className="text-blue-600 hover:underline">
                Register
              </Link>
              <Link href="user-auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 mt-2"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
