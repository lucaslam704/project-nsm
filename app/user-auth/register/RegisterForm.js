"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, FormControl, FormLabel, Input, Text, VStack, Heading, Alert, AlertIcon, Center, useToast } from "@chakra-ui/react";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const toast = useToast();
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
    toast({ title: "Registration successful!", status: "success", duration: 3000, isClosable: true });
    setTimeout(() => router.push("/"), 1000);
  };

  return (
    <Center minH="100vh" bgGradient="linear(to-br, blue.50, gray.100)">
      <Box bg="white" p={8} rounded="lg" shadow="md" w="full" maxW="md">
        <Heading size="lg" textAlign="center" color="blue.800">Create an Account</Heading>
        <Text textAlign="center" color="gray.600">Join NSM and connect with others.</Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} mt={4}>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input id="firstName" value={formData.firstName} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" id="email" value={formData.email} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" id="password" value={formData.password} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Security Question</FormLabel>
              <Input id="securityQuestion" value={formData.securityQuestion} onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Security Answer</FormLabel>
              <Input id="securityAnswer" value={formData.securityAnswer} onChange={handleChange} />
            </FormControl>
            <Button type="submit" colorScheme="blue" w="full">Register</Button>
          </VStack>
        </form>
        <Text textAlign="center" mt={4}>Already have an account? <Link href="/" passHref><Text as="span" color="blue.600" cursor="pointer">Sign in</Text></Link></Text>
      </Box>
    </Center>
  );
}