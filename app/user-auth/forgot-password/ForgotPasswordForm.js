"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Text, VStack, Heading, useToast } from "@chakra-ui/react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const toast = useToast();
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
      toast({ title: "Password reset successful!", status: "success", duration: 2500, isClosable: true });
      router.push("/");
    }
  };

  return (
    <VStack minH="100vh" justify="center" p={8} bgGradient="linear(to-br, blue.50, gray.100)">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" w="full" maxW="md">
        <Heading as="h1" size="lg" textAlign="center" color="blue.800" mb={4}>
          Reset Your Password
        </Heading>
        {error && <Text color="red.500" textAlign="center" mb={4}>{error}</Text>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <Input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} mb={4} required />
            <Button type="submit" colorScheme="blue" w="full">Next</Button>
            <Link href="/" passHref><Text mt={2} textAlign="center" color="blue.600" cursor="pointer">Back to Login</Text></Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSecuritySubmit}>
            <Text mb={2}>{securityQuestion}</Text>
            <Input placeholder="Your Answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} mb={4} required />
            <Button type="submit" colorScheme="blue" w="full">Next</Button>
            <Button variant="link" onClick={() => setStep(1)} mt={2} color="blue.600">Back</Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <Input placeholder="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} mb={4} required />
            <Input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} mb={4} required />
            <Button type="submit" colorScheme="blue" w="full">Reset Password</Button>
            <Button variant="link" onClick={() => setStep(2)} mt={2} color="blue.600">Back</Button>
          </form>
        )}
      </Box>
    </VStack>
  );
}