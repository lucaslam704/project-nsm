"use client";
import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  useDisclosure,
  useColorModeValue
} from "@chakra-ui/react";
import { BellIcon, ArrowLeftIcon, ChatIcon, DownloadIcon } from "@chakra-ui/icons";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

export default function Feed() {
  // Use useDisclosure to control the drawer
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');

  // Example: number of notifications. Replace with your dynamic count.
  const notificationCount = 2;

  return (
    <HStack h="100vh" spacing={0} align="stretch">
      {/* Render Sidebar only once if it's not rendered in a higher layout */}
      <Sidebar />

      <Box flex="1" p={5} overflowY="auto" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Text fontSize="2xl" fontWeight="bold" mb={5}>Home</Text>
        <VStack spacing={5}>
          <Post username="User1" text="Enjoying the new UI!" imgSrc="/pic/sample1.jpg" />
          <Post username="User2" text="Just posted a new photo!" imgSrc="/pic/sample2.jpg" />
        </VStack>
      </Box>

      <Box position="relative">
        <IconButton
          aria-label="Notifications"
          icon={isOpen ? <ArrowLeftIcon /> : <BellIcon />}
          colorScheme="blue"
          borderRadius="full"
          size="lg"
          position="absolute"
          top={5}
          right={5}
          onClick={isOpen ? onClose : onOpen}
        />
        {notificationCount > 0 && !isOpen && (
          <Badge
            position="absolute"
            top="0"
            right="0"
            bg="red.500"
            color="white"
            borderRadius="full"
            px={2}
            fontSize="0.8em"
          >
            {notificationCount}
          </Badge>
        )}
        <RightPanel isOpen={isOpen} onClose={onClose} />
      </Box>
    </HStack>
  );
}

function Post({ username, text, imgSrc }) {
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="md" w="full">
      <Text fontWeight="bold">{username}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.200')} mb={2}>{text}</Text>
      <img src={imgSrc} alt="Post Image" style={{ borderRadius: "8px", marginBottom: "8px" }} />
      <HStack>
        <IconButton aria-label="Comment" icon={<ChatIcon />} colorScheme="blue" />
        <IconButton aria-label="Download" icon={<DownloadIcon />} colorScheme="green" />
      </HStack>
    </Box>
  );
}
