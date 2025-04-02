'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Button, Container } from '@chakra-ui/react';
import Link from 'next/link';

export default function UserAuth() {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 2500);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient="linear(to-br, blue.50, gray.100)">
      <Container bg="white" p={8} borderRadius="lg" boxShadow="md" maxW="md" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color="red.600" mb={4}>
          Access Denied
        </Text>
        <Text color="gray.600" mb={4}>
          You don't have permission to access.
        </Text>
        <Text color="gray.500" mb={6}>
          You will be redirected to the home page.
        </Text>
        <Link href="/" passHref>
          <Button colorScheme="blue" width="full">
            Return to Home
          </Button>
        </Link>
      </Container>
    </Box>
  );
}
