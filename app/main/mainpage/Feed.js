"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/utils/AuthContext";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Button,
  useDisclosure,
  useColorModeValue,
  useToast,
  Flex,
  Avatar
} from "@chakra-ui/react";
import { BellIcon, ArrowLeftIcon, ChatIcon, DownloadIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import StatusPanel from "./StatusPanel";
import CommentSection from "./CommentSection";
import { db } from "@/utils/firebase";
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";

export default function Feed() {
  // Get current user
  const { currentUser } = useAuth();

  // State for posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use useDisclosure to control the notification drawer
  const {
    isOpen: isNotificationOpen,
    onOpen: onNotificationOpen,
    onClose: onNotificationClose
  } = useDisclosure();

  // Use useDisclosure to control the status drawer
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose
  } = useDisclosure();

  // We'll use toast in the Post component, not here

  // Example: number of notifications. Replace with your dynamic count.
  const notificationCount = 2;

  // Function to fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log("Fetching posts from Firestore...");

      // Use a try-catch block to handle potential errors with the query
      try {
        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        console.log("Query created successfully");
        const querySnapshot = await getDocs(postsQuery);
        console.log("Query executed, snapshot received:", querySnapshot.size, "documents");

        const fetchedPosts = [];

        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            console.log("Processing document:", doc.id, data);

            // Handle potential missing data
            if (!data) {
              console.warn("Document has no data:", doc.id);
              return;
            }

            fetchedPosts.push({
              id: doc.id,
              userId: data.userId,
              username: data.username || "Unknown User",
              text: data.text || "",
              imgSrc: data.imgSrc || "/pic/sample1.jpg",
              timestamp: data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : new Date().toISOString()
            });
          } catch (docError) {
            console.error("Error processing document:", doc.id, docError);
          }
        });

        console.log("Processed", fetchedPosts.length, "posts");
        setPosts(fetchedPosts);

        // If we successfully fetched posts but the array is empty, set a different message
        if (fetchedPosts.length === 0) {
          console.log("No posts found");
        }
      } catch (queryError) {
        console.error("Error executing query:", queryError);
        throw new Error(`Query error: ${queryError.message}`);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);

      // If Firestore fails, use sample data as fallback
      const samplePosts = [
        {
          id: '1',
          username: "User1",
          text: "Enjoying the new UI!",
          imgSrc: "/pic/sample1.jpg",
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          username: "User2",
          text: "Just posted a new photo!",
          imgSrc: "/pic/sample2.jpg",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    try {
      // Remove the post from Firestore
      await deleteDoc(doc(db, "posts", postId));
      
      // Remove the post from the state immediately for a responsive UI
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // No need to refresh posts from server since we've already updated both
      // the database and local state
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh posts to ensure UI is in sync with database
      fetchPosts();
    }
  };

  // Handle new status submission
  const handleStatusSubmit = (newPost) => {
    // Add the new post to the state immediately for a responsive UI
    setPosts(prevPosts => [newPost, ...prevPosts]);

    // Refresh posts from the server after a short delay
    // This ensures we have the latest data
    setTimeout(() => {
      fetchPosts();
    }, 1000);
  };

  return (
    <HStack h="100vh" spacing={0} align="stretch">
      {/* Render Sidebar only once if it's not rendered in a higher layout */}
      <Sidebar />

      <Box
        flex="1"
        p={4}
        overflowY="auto"
        bg={useColorModeValue('gray.50', 'gray.900')}
        maxW="800px" // Limit the maximum width
        mx="auto" // Center the content
      >
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Home</Text>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Text mb={3}>Loading posts...</Text>
            <Box display="flex" justifyContent="center">
              <Box
                width="40px"
                height="40px"
                borderRadius="50%"
                border="3px solid"
                borderColor="blue.500"
                borderTopColor="transparent"
                animation="spin 1s linear infinite"
                sx={{
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Box>
          </Box>
        ) : posts.length === 0 ? (
          <Box textAlign="center" py={8} bg="gray.50" borderRadius="md" p={4}>
            <Text>No posts yet. Be the first to share a status!</Text>
            <Button mt={4} colorScheme="green" onClick={onStatusOpen}>
              Create Status
            </Button>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch" width="100%">
            {posts.map((post, index) => (
              <Post
                key={post.id || index}
                id={post.id}
                username={post.username}
                text={post.text}
                imgSrc={post.imgSrc}
                onDelete={handleDeletePost}
                isCurrentUserPost={currentUser && post.userId && currentUser.uid && post.userId === currentUser.uid}
                userId={post.userId}
              />
            ))}
          </VStack>
        )}
      </Box>

      <Box position="relative">
        {/* Status (Plus) Button */}
        <IconButton
          aria-label="Create Status"
          icon={<AddIcon />}
          colorScheme="green"
          borderRadius="full"
          size="md"
          position="absolute"
          top={5}
          right={20} // Increased from 14 to 20 to create more space
          onClick={onStatusOpen}
          zIndex={1}
        />

        {/* Notification Button */}
        <IconButton
          aria-label="Notifications"
          icon={isNotificationOpen ? <ArrowLeftIcon /> : <BellIcon />}
          colorScheme="blue"
          borderRadius="full"
          size="md"
          position="absolute"
          top={5}
          right={5}
          onClick={isNotificationOpen ? onNotificationClose : onNotificationOpen}
          zIndex={1}
        />
        
        {/* Notification Badge */}
        {notificationCount > 0 && !isNotificationOpen && (
          <Badge
            position="absolute"
            top={4}    // Changed from "0" to 3
            right={4}  // Changed from "0" to 3
            bg="red.500"
            color="white"
            borderRadius="full"
            px={2}
            fontSize="0.7em"
            transform="translate(25%, -25%)" // Added transform to overlap with the icon
            zIndex={2}
          >
            {notificationCount}
          </Badge>
        )}

        {/* Notification Panel */}
        <RightPanel isOpen={isNotificationOpen} onClose={onNotificationClose} />

        {/* Status Panel */}
        <StatusPanel
          isOpen={isStatusOpen}
          onClose={onStatusClose}
          onStatusSubmit={handleStatusSubmit}
        />
      </Box>
    </HStack>
  );
}

function Post({ id, username, text, imgSrc, onDelete, isCurrentUserPost, userId }) {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const toast = useToast();

  // Fetch user's profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfilePic(userData.profilePic);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Function to update comment count
  const updateCommentCount = useCallback(() => {
    try {
      const localStorageKey = 'localComments';
      const storedComments = localStorage.getItem(localStorageKey);
      if (storedComments) {
        const allComments = JSON.parse(storedComments);
        const count = allComments.filter(comment => comment.postId === id).length;
        setCommentCount(count);
      } else {
        setCommentCount(0);
      }
    } catch (error) {
      console.error("Error getting comment count from localStorage:", error);
      setCommentCount(0);
    }
  }, [id]);

  // Update comment count when component mounts and when comments change
  useEffect(() => {
    updateCommentCount();
  }, [updateCommentCount]);

  // Handle new comment added
  const handleCommentAdded = useCallback(() => {
    updateCommentCount();
  }, [updateCommentCount]);

  // Function to handle image errors
  const handleImageError = (e) => {
    console.error("Image failed to load:", imgSrc);
    e.target.src = "/pic/sample1.jpg"; // Fallback image
  };

  // Function to handle post deletion
  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);

      // Delete the post from Firestore
      await deleteDoc(doc(db, "posts", id));

      // Delete comments from localStorage
      try {
        const localStorageKey = 'localComments';
        const storedComments = localStorage.getItem(localStorageKey);
        if (storedComments) {
          const allComments = JSON.parse(storedComments);
          const remainingComments = allComments.filter(comment => comment.postId !== id);
          localStorage.setItem(localStorageKey, JSON.stringify(remainingComments));
        }
      } catch (storageError) {
        console.error("Error removing comments from localStorage:", storageError);
      }

      // Call the onDelete callback to update the UI
      if (onDelete) {
        onDelete(id);
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      bg={bgColor}
      p={3}
      borderRadius="md"
      boxShadow="sm"
      w="full"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex justify="space-between" align="center" mb={1}>
        <HStack>
          <Avatar 
            size="sm" 
            name={username} 
            src={userProfilePic} 
          />
          <Text fontWeight="bold" fontSize="md">{username}</Text>
        </HStack>
        {isCurrentUserPost && (
          <IconButton
            aria-label="Delete post"
            icon={<DeleteIcon />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            isLoading={isDeleting}
            onClick={handleDelete}
          />
        )}
      </Flex>
      <Text color={useColorModeValue('gray.600', 'gray.200')} fontSize="sm" mb={2}>{text}</Text>

      {/* Handle both regular URLs and data URLs */}
      <Box
        position="relative"
        width="100%"
        paddingBottom="56.25%" // 16:9 aspect ratio
        overflow="hidden"
        borderRadius="md"
        mb={2}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <img
          src={imgSrc}
          alt="Post Image"
          onError={handleImageError}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      </Box>

      <HStack spacing={2}>
        <Box position="relative">
          <IconButton
            aria-label="Comment"
            icon={<ChatIcon />}
            colorScheme="blue"
            size="sm"
            variant="ghost"
            onClick={() => setIsCommentSectionOpen(true)}
          />
          {commentCount > 0 && (
            <Box
              position="absolute"
              top="-8px"
              right="-8px"
              bg="red.500"
              color="white"
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              w="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {commentCount > 99 ? '99+' : commentCount}
            </Box>
          )}
        </Box>
        <IconButton
          aria-label="Download"
          icon={<DownloadIcon />}
          colorScheme="green"
          size="sm"
          variant="ghost"
          onClick={() => {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = imgSrc;
            link.download = `post-image-${id || Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show toast notification
            toast({
              title: "Image downloaded",
              description: "The image has been downloaded successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }}
        />
      </HStack>

      {/* Comment Section Modal */}
      <CommentSection
        isOpen={isCommentSectionOpen}
        onClose={() => setIsCommentSectionOpen(false)}
        postId={id}
        postUsername={username}
        onCommentAdded={handleCommentAdded}
        postUserProfilePic={userProfilePic}
      />
    </Box>
  );
}
