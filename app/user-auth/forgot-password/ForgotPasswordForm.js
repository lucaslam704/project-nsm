"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");

  const fakeDB = {
    "admin@gmail.com": {
      securityQuestion: "What is your favorite color?",
      securityAnswer: "blue",
    },
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (fakeDB[email]) {
      setSecurityQuestion(fakeDB[email].securityQuestion);
      setStep(2);
      setError("");
    } else {
      setError("Email not found.");
    }
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (securityAnswer.toLowerCase() === fakeDB[email].securityAnswer) {
      setStep(3);
      setError("");
    } else {
      setError("Incorrect answer.");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
    } else {
      alert("Password reset successful!");
      router.push("/");
    }
  };

  return (
    <div className="grid place-items-center min-h-screen p-8 bg-gradient-to-br from-blue-50 to-gray-100 font-[family-name:var(--font-geist-sans)]">
      <main className="bg-white shadow-md rounded-lg p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 text-center">
          Reset Your Password
        </h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="Enter your email"
              required
            />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              Next
            </button>
            <Link href="/" className="text-blue-600 text-sm text-center hover:underline">
              Back to Login
            </Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-900">{securityQuestion}</p>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="Your Answer"
              required
            />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              Next
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-blue-600 text-sm hover:underline"
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="New Password"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="Confirm Password"
              required
            />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-blue-600 text-sm hover:underline"
            >
              Back
            </button>
          </form>
        )}
      </main>
    </div>
  );
}