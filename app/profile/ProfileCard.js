import { Avatar, Box, Heading, Input, Flex } from '@chakra-ui/react';

export default function ProfileCard({ user, userInfo, onUpload }) {
  return (
    <Flex bg="#242526" p={6} borderRadius="lg" boxShadow="md" align="center" gap={6}>
      <Avatar src={userInfo.profilePic} name={userInfo.displayName || user.email} size="xl" />
      <Box flex="1">
        <Heading size="md">{userInfo.displayName || user.email}</Heading>
        <Input type="file" mt={2} onChange={onUpload} variant="unstyled" fontSize="sm" />
      </Box>
    </Flex>
  );
}
