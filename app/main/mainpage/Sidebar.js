import { Box, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import  Link from "next/link";

export default function Sidebar() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box w="250px" bg={bgColor} color={textColor} p={5} borderRightRadius="lg">
      <Text fontSize="xl" fontWeight="bold" mb={5}>Dashboard</Text>
      <VStack align="stretch" spacing={4}>
        <Text cursor="pointer" _hover={{ color: "blue.400" }}>Home</Text>
        <Text cursor="pointer" _hover={{ color: "blue.400" }}>News</Text>
        <Link
            onClick={() => localStorage.removeItem('adminEmail')}
            href="/"
            cursor="pointer" _hover={{ color: "blue.400" }}>Log Out</Link>
      </VStack>
    </Box>
  );
}
