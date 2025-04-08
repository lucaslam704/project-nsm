import { Box, Button, Input, Textarea } from '@chakra-ui/react';

export default function PostForm({ newPost, setNewPost, setNewPostImage, onSubmit }) {
  return (
    <Box bg="#242526" p={4} borderRadius="lg" boxShadow="md">
      <Textarea
        placeholder="What's on your mind?"
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        bg="#3a3b3c"
        borderColor="#3a3b3c"
        _placeholder={{ color: 'gray.400' }}
        color="white"
        resize="none"
      />
      <Input
        type="file"
        mt={3}
        color="white"
        onChange={(e) => setNewPostImage(e.target.files[0])}
      />
      <Button onClick={onSubmit} mt={3} colorScheme="blue">
        Post
      </Button>
    </Box>
  );
}
