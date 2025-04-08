"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Link,
  Container,
} from "@chakra-ui/react";
import { useAuth } from "@/utils/AuthContext";

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      localStorage.setItem("userEmail", email);
      router.push("/main");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, blue.50, gray.100)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <Container maxW="md" p={8} bg="white" boxShadow="lg" borderRadius="lg">
        <VStack spacing={6} align="center">
          <Heading color="blue.800">Welcome to NSM</Heading>
          <Text color="gray.600" textAlign="center">
            Spend your time simply and joyfully with everybody.
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Box as="form" w="full" onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.500">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  focusBorderColor="blue.500"
                  color="gray.500"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.500">Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  focusBorderColor="blue.500"
                  color="gray.500"
                />
              </FormControl>

              <Box display="flex" justifyContent="space-between" w="full" fontSize="sm">
                <Link color="blue.600" href="user-auth/register" _hover={{ textDecoration: "underline" }}>
                  Register
                </Link>
                <Link color="blue.600" href="user-auth/forgot-password" _hover={{ textDecoration: "underline" }}>
                  Forgot your password?
                </Link>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={loading}
                loadingText="Logging in"
              >
                Login
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
