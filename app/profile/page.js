"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";import { Box } from "@chakra-ui/react";
import Profile from "./Profile";import { useAuth } from "@/utils/AuthContext";
export default function ProfileMainPage() {
  const router = useRouter();  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (!currentUser) {      const redirectTimer = setTimeout(() => {
        router.push("/");      }, 2500);
      return () => clearTimeout(redirectTimer);
    }  }, [currentUser, router]);

  if (currentUser) {
    return <Profile />;  }

  return null;
}













