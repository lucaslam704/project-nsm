"use client";
import { useState, useEffect } from "react";
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
  Flex
} from "@chakra-ui/react";
import { BellIcon, ArrowLeftIcon, ChatIcon, DownloadIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import StatusPanel from "./StatusPanel";
import { db } from "@/utils/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

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
              imgSrc: data.imgSrc || "/pic/sample1.jpg", // Use the stored image URL or fallback
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
  const handleDeletePost = (postId) => {
    // Remove the post from the state immediately for a responsive UI
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    // Refresh posts from the server after a short delay
    // This ensures we have the latest data
    setTimeout(() => {
      fetchPosts();
    }, 1000);
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
          size="md" // Smaller button
          position="absolute"
          top={5}
          right={14} // Position to the left of notification button
          onClick={onStatusOpen}
          zIndex={1}
        />

        {/* Notification Button */}
        <IconButton
          aria-label="Notifications"
          icon={isNotificationOpen ? <ArrowLeftIcon /> : <BellIcon />}
          colorScheme="blue"
          borderRadius="full"
          size="md" // Smaller button
          position="absolute"
          top={5}
          right={5}
          onClick={isNotificationOpen ? onNotificationClose : onNotificationOpen}
          zIndex={1}
        />
        {notificationCount > 0 && !isNotificationOpen && (
          <Badge
            position="absolute"
            top="0"
            right="0"
            bg="red.500"
            color="white"
            borderRadius="full"
            px={2}
            fontSize="0.7em" // Smaller font
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

function Post({ id, username, text, imgSrc, onDelete, isCurrentUserPost }) {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

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

      // Import Firestore functions directly in the component
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/utils/firebase');

      // Delete the document from Firestore
      await deleteDoc(doc(db, "posts", id));

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
        <Text fontWeight="bold" fontSize="md">{username}</Text>
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
        <IconButton
          aria-label="Comment"
          icon={<ChatIcon />}
          colorScheme="blue"
          size="sm"
          variant="ghost"
        />
        <IconButton
          aria-label="Download"
          icon={<DownloadIcon />}
          colorScheme="green"
          size="sm"
          variant="ghost"
        />
      </HStack>
    </Box>
  );
}
