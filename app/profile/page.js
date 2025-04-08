'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db, storage } from '@/utils/firebase';
import {
  collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc, setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Box, Flex, VStack } from '@chakra-ui/react';
import Sidebar from '../main/mainpage/Sidebar';
import RightPanel from '../main/mainpage/RightPanel';
import ProfileCard from './ProfileCard';
import PostForm from './PostForm';
import PostItem from './PostItem';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({ displayName: '', profilePic: '' });
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        fetchPosts(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPosts = async (uid) => {
    const q = query(collection(db, 'posts'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleNewPost = async () => {
    if (!newPost.trim() && !newPostImage) return;
    let imageUrl = '';

    try {
      if (newPostImage) {
        const imageRef = ref(storage, `postImages/${user.uid}/${Date.now()}-${newPostImage.name}`);
        await uploadBytes(imageRef, newPostImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        content: newPost,
        imageUrl,
        createdAt: new Date(),
        displayName: userInfo.displayName,
        profilePic: userInfo.profilePic,
      });
      

      setNewPost('');
      setNewPostImage(null);
      fetchPosts(user.uid);
    } catch (err) {
      console.warn('Error posting:', err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'users', user.uid), { profilePic: url }, { merge: true });
      setUserInfo(prev => ({ ...prev, profilePic: url }));
    } catch (err) {
      console.warn('Error uploading profile pic:', err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.warn('Error deleting post:', err.message);
    }
  };

  return (
    <Flex minH="100vh" bg="#1c1e21" color="white">
      <Sidebar />
      <Box flex="1" py={8} px={4}>
        <Box maxW="800px" mx="auto">
          {user && (
            <VStack spacing={6} align="stretch">
              <ProfileCard user={user} userInfo={userInfo} onUpload={handleImageUpload} />
              <PostForm
                newPost={newPost}
                setNewPost={setNewPost}
                setNewPostImage={setNewPostImage}
                onSubmit={handleNewPost}
              />
              {posts.map((post) => (
                <PostItem key={post.id} post={post} onDelete={() => handleDeletePost(post.id)} />
              ))}
            </VStack>
          )}
        </Box>
      </Box>
      <RightPanel />
    </Flex>
  );
}
