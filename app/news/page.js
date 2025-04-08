"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";import { Box } from "@chakra-ui/react";
import NewsFeed from "./NewsFeed";import { useAuth } from "@/utils/AuthContext";
export default function NewsPage() {
  const router = useRouter();  const { currentUser } = useAuth();
  useEffect(() => {
    if (!currentUser) {      const redirectTimer = setTimeout(() => {
        router.push("/");      }, 2500);
      return () => clearTimeout(redirectTimer);
    }  }, [currentUser, router]);
  if (currentUser) {
    return <NewsFeed />;  }

  return null;
}














