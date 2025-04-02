"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Button, Text, Flex, Spinner } from "@chakra-ui/react";
import Feed from "./mainpage/Feed";

export default function App() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        if (typeof window !== "undefined") {
          const adminEmail = localStorage.getItem("adminEmail");
          setIsAdmin(adminEmail === "admin@gmail.com");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 2500);

      return () => clearTimeout(redirectTimer);
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isAdmin) {
    return (
      <Flex direction="column" height="100vh" bg="gray.100">
        <Feed />
      </Flex>
    );
  } else {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-br, blue.50, gray.100)"
      >
        <Box bg="white" p={8} rounded="lg" shadow="md" maxW="md" width="full">
          <Text fontSize="2xl" fontWeight="bold" color="red.600" mb={4} textAlign="center">
            Access Denied
          </Text>
          <Text color="gray.600" mb={6} textAlign="center">
            This server is only available for administrators.
          </Text>
          <Text color="gray.500" mb={6} textAlign="center">
            You will be redirected to the home page.
          </Text>
        </Box>
      </Box>
    );
  }
}
