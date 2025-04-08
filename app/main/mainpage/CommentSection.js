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
import { SmileIcon, SendIcon } from "../../../components/icons"; 
import { useAuth } from "@/utils/AuthContext";
import EmojiPicker from 'emoji-picker-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export default function CommentSection({ 
  isOpen, 
  onClose, 
  postId, 
  postUsername, 
  onCommentAdded,
  postUserProfilePic 
}) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userProfiles, setUserProfiles] = useState({}); // Cache for user profiles
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch user profiles for comments
  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!comments.length) return;

      const uniqueUserIds = [...new Set(comments.map(comment => comment.userId))];
      const profiles = {};

      for (const userId of uniqueUserIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data().profilePic;
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }

      setUserProfiles(profiles);
    };

    fetchUserProfiles();
  }, [comments]);

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
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      // Get current user's profile
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userProfilePic = userDoc.exists() ? userDoc.data().profilePic : null;

      const commentData = {
        postId: postId,
        userId: currentUser.uid,
        username: currentUser.email?.split('@')[0] || "User",
        text: newComment.trim(),
        createdAt: new Date(),
        userProfilePic: userProfilePic // Include profile pic in comment data
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

        // Notify parent component about the new comment
        if (onCommentAdded) {
          onCommentAdded(postId);
        }
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

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Edmonton'// Adjust this to your timezone
    };

    return new Date(date).toLocaleString('en-US', options);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={2}>
            <Avatar 
              size="sm" 
              name={postUsername} 
              src={postUserProfilePic}
            />
            <Text>{postUsername}'s Post</Text>
          </Flex>
        </ModalHeader>
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
                      <Avatar 
                        size="xs" 
                        name={comment.username} 
                        src={userProfiles[comment.userId] || comment.userProfilePic}
                      />
                      <Text fontWeight="bold" fontSize="sm">{comment.username}</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt))}
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
