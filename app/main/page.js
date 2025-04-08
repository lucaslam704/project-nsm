"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button, Text, Flex, Spinner } from "@chakra-ui/react";
import Feed from "./mainpage/Feed";
import { useAuth } from "@/utils/AuthContext";

export default function App() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    // If no user is logged in, redirect to login page
    if (!currentUser) {
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 2500);

      return () => clearTimeout(redirectTimer);
    }
  }, [currentUser, router]);

  // Show loading state while authentication is being checked
  if (typeof currentUser === 'undefined') {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // If user is authenticated, show the main app
  if (currentUser) {
    return (
        <Feed />
    );
  }

  // If not authenticated, show access denied
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, blue.50, gray.100)"
    >
      <Box bg="white" p={8} rounded="lg" shadow="md" maxW="md" width="full">
        <Text fontSize="2xl" fontWeight="bold" color="black.600" mb={4} textAlign="center">
          Loading..........
        </Text>
      </Box>
    </Box>
  );
}
