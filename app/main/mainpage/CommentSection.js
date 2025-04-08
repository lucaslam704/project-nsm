import { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Flex,
  IconButton,
  Divider,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Spinner
} from "@chakra-ui/react";
// We'll use custom icons instead of Chakra UI icons
import { useAuth } from "@/utils/AuthContext";
import EmojiPicker from 'emoji-picker-react';

// Custom SmileIcon since it's not included in Chakra UI icons
function SmileIcon(props) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
      <path d="M14.829 14.828a4.055 4.055 0 0 1-1.272.858 4.002 4.002 0 0 1-4.875-1.45l-1.658 1.119a6.063 6.063 0 0 0 1.621 1.62 5.963 5.963 0 0 0 2.148.903 6.042 6.042 0 0 0 2.415 0 5.972 5.972 0 0 0 2.148-.903c.313-.212.612-.458.886-.731.272-.271.52-.571.734-.889l-1.658-1.119a4.017 4.017 0 0 1-.489.592z"></path>
      <circle cx="8.5" cy="10.5" r="1.5"></circle>
      <circle cx="15.493" cy="10.493" r="1.493"></circle>
    </svg>
  );
}

// Custom SendIcon since it's not included in Chakra UI icons
function SendIcon(props) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

export default function CommentSection({ isOpen, onClose, postId, postUsername }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();
  // Define color mode values for the component
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Current authentication state:", currentUser ? "Logged in" : "Not logged in");
    if (currentUser) {
      console.log("User ID:", currentUser.uid);
      console.log("User email:", currentUser.email);
    }
  }, [currentUser]);

  // Fetch comments from local storage when the component mounts or postId changes
  useEffect(() => {
    if (!postId || !isOpen) return;

    setLoading(true);
    console.log("Fetching comments for post:", postId);

    // Try to get comments from localStorage
    try {
      // Get all comments from localStorage
      const localStorageKey = 'localComments';
      const storedComments = localStorage.getItem(localStorageKey);
      let allComments = [];

      if (storedComments) {
        allComments = JSON.parse(storedComments);
      }

      // Filter comments for this post
      const postComments = allComments.filter(comment => comment.postId === postId);

      // Sort comments by createdAt (newest first)
      postComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log(`Found ${postComments.length} comments for post ${postId} in local storage`);

      // Update state
      setComments(postComments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching comments from localStorage:", error);
      setComments([]);
      setLoading(false);
    }

    // Return a cleanup function
    return () => {
      // Nothing to clean up
    };
  }, [postId, isOpen]);

  // Handle clicking outside of emoji picker to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const textAfterCursor = newComment.slice(cursorPosition);

    setNewComment(textBeforeCursor + emoji + textAfterCursor);

    // Focus back on input after selecting emoji
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart = cursorPosition + emoji.length;
      inputRef.current.selectionEnd = cursorPosition + emoji.length;
    }, 10);
  };

  // Handle submitting a new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to comment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log("Starting comment submission process...");
      console.log("Current user:", currentUser);
      console.log("Post ID:", postId);

      // Create a simple comment object
      const commentData = {
        postId: postId,
        userId: currentUser.uid,
        username: currentUser.email?.split('@')[0] || "User",
        text: newComment.trim(),
        createdAt: new Date() // Use a JavaScript Date instead of serverTimestamp for immediate feedback
      };

      console.log("Comment data prepared:", commentData);

      // Add the comment to the local state immediately for better UX
      const optimisticComment = {
        id: 'temp-' + Date.now(),
        ...commentData
      };

      // Update local state with the new comment
      setComments(prevComments => [...prevComments, optimisticComment]);

      // Clear the input immediately for better UX
      setNewComment("");

      // Show a success message
      toast({
        title: "Comment added",
        description: "Your comment has been added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Save the comment to localStorage
      try {
        const localStorageKey = 'localComments';
        let allComments = [];

        // Get existing comments
        const storedComments = localStorage.getItem(localStorageKey);
        if (storedComments) {
          allComments = JSON.parse(storedComments);
        }

        // Add the new comment
        allComments.push(optimisticComment);

        // Save back to localStorage
        localStorage.setItem(localStorageKey, JSON.stringify(allComments));
        console.log("Comment saved to localStorage");
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
      }

    } catch (error) {
      console.error("Error adding comment:", error);

      // Remove the optimistic comment from the local state
      setComments(prevComments => prevComments.filter(comment => !comment.id.startsWith('temp-')));

      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return date.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Comments on {postUsername}'s post</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : comments.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No comments yet. Be the first to comment!</Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto" pr={2}>
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" mb={1}>
                    <HStack>
                      <Avatar size="xs" name={comment.username} />
                      <Text fontWeight="bold" fontSize="sm">{comment.username}</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(comment.createdAt)}
                    </Text>
                  </Flex>
                  <Text fontSize="md">{comment.text}</Text>
                </Box>
              ))}
            </VStack>
          )}

          <Divider my={4} />

          <Box position="relative">
            {currentUser ? (
              <>
                <HStack>
                  <Input
                    ref={inputRef}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitComment();
                      }
                    }}
                  />
                  <IconButton
                    aria-label="Add emoji"
                    icon={<SmileIcon />}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    colorScheme="yellow"
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Send comment"
                    icon={<SendIcon />}
                    onClick={handleSubmitComment}
                    colorScheme="blue"
                    isDisabled={!newComment.trim()}
                  />
                </HStack>

                {showEmojiPicker && (
                  <Box
                    ref={emojiPickerRef}
                    position="absolute"
                    bottom="50px"
                    right="0"
                    zIndex="10"
                  >
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </Box>
                )}
              </>
            ) : (
              <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                <Text>Please log in to add comments</Text>
              </Box>
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
