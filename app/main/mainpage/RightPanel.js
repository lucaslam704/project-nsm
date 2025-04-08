import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  Box,
  useColorModeValue
} from "@chakra-ui/react";

export default function RightPanel({ isOpen, onClose }) {
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>Notifications</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch">
            <Notification text="User @2 commented on your post '.....'!" />
            <Notification text="Your post '....' has new comments !" />
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

function Notification({ text }) {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  return (
    <Box bg={bgColor} p={3} borderRadius="lg">{text}</Box>
  );
}
