"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Text, VStack, Heading, useToast, Alert, AlertIcon, FormControl, FormLabel } from "@chakra-ui/react";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if email exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Email not found. Please check your email address.");
        setLoading(false);
        return;
      }

      // Get the security question for this user
      const userDoc = querySnapshot.docs[0];
      const userDataFromDB = userDoc.data();
      setUserData(userDataFromDB);

      // Check if security question exists
      if (!userDataFromDB.securityQuestion) {
        setError("This account doesn't have a security question set up. Please contact support.");
        setLoading(false);
        return;
      }

      setSecurityQuestion(userDataFromDB.securityQuestion);
      setStep(2);
      setError("");
    } catch (error) {
      console.error("Error checking email:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify security answer
      if (!userData || !userData.securityAnswer) {
        setError("Security answer verification failed. Please try again.");
        setLoading(false);
        return;
      }

      // Compare security answers (case insensitive)
      if (securityAnswer.toLowerCase() !== userData.securityAnswer.toLowerCase()) {
        setError("Incorrect answer. Please try again.");
        setLoading(false);
        return;
      }

      // If security answer is correct, proceed to password reset step
      setStep(3);
      setError("");
    } catch (error) {
      console.error("Error verifying security answer:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate passwords
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        await login(email, newPassword);

        toast({
          title: "Password reset successful!",
          description: "Your password has been updated. You can now log in with your new password.",
          status: "success",
          duration: 5000,
          isClosable: true
        });

        // Redirect to login page
        router.push("/");
      } catch (signInError) {
        console.error("Error updating password:", signInError);
        setError("Failed to update password. Please try again or contact support.");
      }
    } catch (error) {
      console.error("Error in password reset:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack minH="100vh" justify="center" p={8} bgGradient="linear(to-br, blue.50, gray.100)">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" w="full" maxW="md">
        <Heading as="h1" size="lg" textAlign="center" color="blue.800" mb={4}>
          Reset Your Password
        </Heading>
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <Input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} mb={4} required />
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Checking"
            >
              Next
            </Button>
            <Link href="/" passHref><Text mt={2} textAlign="center" color="blue.600" cursor="pointer">Back to Login</Text></Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSecuritySubmit}>
            <Text mb={2}>{securityQuestion}</Text>
            <Input placeholder="Your Answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} mb={4} required />
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Verifying"
            >
              Next
            </Button>
            <Button variant="link" onClick={() => setStep(1)} mt={2} color="blue.600">Back</Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <FormControl mb={4}>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={loading}
              loadingText="Resetting Password"
            >
              Reset Password
            </Button>
            <Button variant="link" onClick={() => setStep(2)} mt={2} color="blue.600">Back</Button>
          </form>
        )}


      </Box>
    </VStack>
  );
}