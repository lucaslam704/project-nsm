import { Box, Button, Text } from '@chakra-ui/react';
import Image from 'next/image';

export default function PostItem({ post, onDelete }) {
  return (
    <Box bg="#242526" p={4} borderRadius="lg" boxShadow="md">
      <Text mb={2}>{post.content}</Text>
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt="Post Image"
          width={600}
          height={400}
          className="rounded-lg"
        />
      )}
      <Button
        onClick={onDelete}
        mt={3}
        colorScheme="red"
        size="sm"
      >
        Delete Post
      </Button>
    </Box>
  );
}
