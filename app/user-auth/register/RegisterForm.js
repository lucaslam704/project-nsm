"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, FormControl, FormLabel, Input, Text, VStack, Heading, Alert, AlertIcon, Center, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function Register() {
  const router = useRouter();
  const toast = useToast();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await signup(formData.email, formData.password);

      try {
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer,
          createdAt: new Date().toISOString(),
        });
      } catch (firestoreError) {
        console.error("Firestore write error:", firestoreError);
      }

      toast({ title: "Registration successful!", status: "success", duration: 3000, isClosable: true });
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bgGradient="linear(to-br, blue.50, gray.100)">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Heading size="lg" textAlign="center" color="blue.800">Create an Account</Heading>
        <Text textAlign="center" color="gray.600">Join NSM and connect with others.</Text>

        {error && (
          <Alert status="error" mt={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} mt={4}>
            <FormControl isRequired>
              <FormLabel color="red.500">First Name</FormLabel>
              <Input id="firstName" value={formData.firstName} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="red.500">Last Name</FormLabel>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="red.500">Email</FormLabel>
              <Input type="email" id="email" value={formData.email} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="red.500">Password</FormLabel>
              <Input type="password" id="password" value={formData.password} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="red.500">Confirm Password</FormLabel>
              <Input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="red.500">Security Question</FormLabel>
              <Input id="securityQuestion" value={formData.securityQuestion} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="red.500">Security Answer</FormLabel>
              <Input id="securityAnswer" value={formData.securityAnswer} onChange={handleChange} color="gray.500"/>
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Registering"
            >
              Register
            </Button>
          </VStack>
        </form>
        <Text textAlign="center" mt={4}>Already have an account? <Link href="/" passHref><Text as="span" color="blue.600" cursor="pointer">Sign in</Text></Link></Text>
      </Box>
    </Center>
  );
}