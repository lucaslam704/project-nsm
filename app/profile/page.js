'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '@/utils/firebase';
import {
  collection, doc, getDoc, updateDoc, query, where, getDocs
} from 'firebase/firestore';
import {
  Box, Flex, VStack, Text, Textarea, Button, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Input, useToast, Divider, Stack, RadioGroup, Radio, HStack, useColorModeValue
} from '@chakra-ui/react';
import Sidebar from '../main/mainpage/Sidebar';
import RightPanel from '../main/mainpage/RightPanel';
import ProfileCard from './ProfileCard';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({ 
    displayName: '', 
    profilePic: '',
    bio: '',
    securityQuestion: '',
    securityAnswer: '' 
  });
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen: isRightPanelOpen, onOpen: onRightPanelOpen, onClose: onRightPanelClose } = useDisclosure();

  // Fetch user posts from Firebase
  const fetchUserPosts = async (userId) => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const posts = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort posts by timestamp (newest first)
      posts.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast({
        title: "Error fetching posts",
        description: "Unable to load your posts",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserInfo(userData);
          setBio(userData.bio || '');
        }
        // Fetch user posts when user is authenticated
        await fetchUserPosts(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (croppedImageBase64) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profilePic: croppedImageBase64
      });
      
      setUserInfo(prev => ({
        ...prev,
        profilePic: croppedImageBase64
      }));

      toast({
        title: "Profile picture updated",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Error updating profile picture",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleBioUpdate = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { bio });
      setUserInfo(prev => ({ ...prev, bio }));
      setIsEditingBio(false);
      toast({
        title: "Bio updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Error updating bio",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Flex h="100vh">
      <Sidebar />
      
      <Box 
        flex="1" 
        p={4} 
        overflowY="auto" 
        maxW="800px" 
        mx="auto"
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        {user && (
          <VStack spacing={6} align="stretch">
            <ProfileCard user={user} userInfo={userInfo} onUpload={handleImageUpload} />
            
            {/* Bio Section */}
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold">Bio</Text>
                <Button size="sm" onClick={() => setIsEditingBio(!isEditingBio)}>
                  {isEditingBio ? 'Cancel' : 'Edit'}
                </Button>
              </Flex>
              {isEditingBio ? (
                <VStack>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                  />
                  <Button colorScheme="blue" size="sm" onClick={handleBioUpdate}>
                    Save Bio
                  </Button>
                </VStack>
              ) : (
                <Text>{userInfo.bio || 'No bio yet'}</Text>
              )}
            </Box>

            {/* User Posts Section */}
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={4}>Your Posts</Text>
              {loading ? (
                <Text>Loading posts...</Text>
              ) : userPosts.length === 0 ? (
                <Text>No posts yet</Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {userPosts.map((post) => (
                    <Box 
                      key={post.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      bg="white"
                      shadow="sm"
                    >
                      <Text mb={2}>{post.text}</Text>
                      {post.imgSrc && (
                        <Box
                          position="relative"
                          width="100%"
                          paddingBottom="56.25%"
                          overflow="hidden"
                          borderRadius="md"
                          mb={2}
                        >
                          <img
                            src={post.imgSrc}
                            alt="Post"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}
                      <Text fontSize="sm" color="gray.500">
                        Posted on: {post.createdAt?.toDate().toLocaleDateString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        )}
      </Box>

      {/* RightPanel */}
      <RightPanel isOpen={isRightPanelOpen} onClose={onRightPanelClose} />
    </Flex>
  );
}
