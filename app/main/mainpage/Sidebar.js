'use client';

import { Box, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";

export default function Sidebar() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navItems = [
    { label: "Profile", href: "/profile" },
    { label: "Home", href: "/main" },
    { label: "News", href: "/news" },
    { label: "Log Out", href: "#", onClick: handleLogout }, // Changed to use onClick instead of href
  ];

  return (
    <Box w="250px" bg={bgColor} color={textColor} p={5} borderRightRadius="lg" minH="100vh">
      <Text fontSize="xl" fontWeight="bold" mb={5}>Dashboard</Text>
      <VStack align="stretch" spacing={4}>
        {navItems.map((item) => (
          <Box key={item.href}>
            {item.onClick ? (
              <Text
                p={2}
                borderRadius="md"
                bg={pathname === item.href ? "blue.500" : "transparent"}
                color={pathname === item.href ? "white" : "inherit"}
                _hover={{ bg: "blue.400", color: "white" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={item.onClick}
              >
                {item.label}
              </Text>
            ) : (
              <Link href={item.href}>
                <Text
                  p={2}
                  borderRadius="md"
                  bg={pathname === item.href ? "blue.500" : "transparent"}
                  color={pathname === item.href ? "white" : "inherit"}
                  _hover={{ bg: "blue.400", color: "white" }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  {item.label}
                </Text>
              </Link>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
