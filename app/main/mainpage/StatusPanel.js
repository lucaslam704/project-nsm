import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/utils/AuthContext";
import { db } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  Box,
  Button,
  Input,
  Text,
  Image,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

export default function StatusPanel({ isOpen, onClose, onStatusSubmit }) {
  const { currentUser } = useAuth();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Function to compress image
  const compressImage = useCallback((file, maxWidth = 1200, maxHeight = 900, quality = 0.9) => {
    return new Promise((resolve, reject) => {
      setCompressing(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        // Use HTMLImageElement instead of Image to avoid conflict with Chakra UI Image component
        const img = new window.Image(); // Use window.Image to explicitly reference the HTML Image constructor
        img.src = event.target.result;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to data URL with reduced quality
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Calculate size reduction
          const originalSize = Math.round(file.size / 1024);
          const newSize = Math.round((dataUrl.length * 3) / 4 / 1024); // Approximate size calculation

          console.log(`Image compressed from ${originalSize}KB to ${newSize}KB (${Math.round((newSize / originalSize) * 100)}%)`);

          setCompressing(false);
          resolve(dataUrl);
        };
        img.onerror = (error) => {
          setCompressing(false);
          reject(error);
        };
      };
      reader.onerror = (error) => {
        setCompressing(false);
        reject(error);
      };
    });
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 5MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setImage(file);

      try {
        // Show a loading state while compressing
        toast({
          title: "Compressing image",
          description: "Please wait while we optimize your image...",
          status: "info",
          duration: 2000,
          isClosable: true,
        });

        // Compress the image
        const compressedImage = await compressImage(file);

        // Set the compressed image as the preview
        setImagePreview(compressedImage);

        // Show success message with compression info
        const originalSize = Math.round(file.size / 1024);
        const newSize = Math.round((compressedImage.length * 3) / 4 / 1024);
        const reduction = Math.round(((originalSize - newSize) / originalSize) * 100);

        if (reduction > 0) {
          toast({
            title: "Image optimized",
            description: `Reduced by ${reduction}% (${originalSize}KB → ${newSize}KB)`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error compressing image:", error);

        // Fallback to standard preview if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        toast({
          title: "Compression failed",
          description: "Using original image instead",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      toast({
        title: "Image required",
        description: "Please upload an image for your status",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please add a caption for your status",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Show processing toast
      toast({
        title: "Processing image",
        description: "Please wait while your image is being processed...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });

      // Use the compressed image preview directly (base64 data URL)
      const imagePath = imagePreview;

      console.log('Using image preview as data URL');

      // Save the post data to Firestore
      const username = currentUser?.email?.split('@')[0] || "User";

      // Create post data
      const postData = {
        userId: currentUser?.uid,
        username: username,
        text: caption,
        imgSrc: imagePath, // Use the data URL directly
        createdAt: serverTimestamp()
      };

      // Save post to Firestore
      try {
        console.log('Saving post to Firestore...');
        const docRef = await addDoc(collection(db, "posts"), postData);
        console.log('Post saved successfully with ID:', docRef.id);

        // Create a post object for the UI
        const newPost = {
          id: docRef.id,
          userId: currentUser?.uid,
          username: username,
          text: caption,
          imgSrc: imagePath,
          timestamp: new Date().toISOString()
        };

        // Call the callback function to update the feed
        onStatusSubmit(newPost);
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
        throw new Error(`Failed to save post: ${firestoreError.message}`);
      }

      // Reset form and close drawer
      setImage(null);
      setImagePreview(null);
      setCaption("");
      setIsUploading(false);
      onClose();

      toast({
        title: "Status posted!",
        description: "Your status has been posted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error posting status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post your status. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setImage(null);
    setImagePreview(null);
    setCaption("");
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleCancel} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Create New Status</DrawerHeader>
        <DrawerBody>
          <VStack spacing={6} align="stretch" py={4}>
            <Box>
              <FormControl>
                <FormLabel>Upload Image</FormLabel>
                {compressing ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    h="200px"
                    borderStyle="dashed"
                    borderWidth="2px"
                    borderColor="gray.300"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="md"
                  >
                    <Box
                      width="40px"
                      height="40px"
                      borderRadius="50%"
                      border="3px solid"
                      borderColor="blue.500"
                      borderTopColor="transparent"
                      animation="spin 1s linear infinite"
                      mb={3}
                      sx={{
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                    <Text>Optimizing image...</Text>
                  </Box>
                ) : imagePreview ? (
                  <Box position="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      borderRadius="md"
                      maxH="300px"
                      objectFit="contain"
                      mx="auto"
                    />
                    <Button
                      position="absolute"
                      top="2"
                      right="2"
                      colorScheme="red"
                      size="sm"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current.click()}
                    w="full"
                    h="150px"
                    borderStyle="dashed"
                    borderWidth="2px"
                    borderColor="gray.300"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                  >
                    <AddIcon boxSize={6} mb={2} />
                    <Text>Click to upload image</Text>
                  </Button>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  display="none"
                />
              </FormControl>
            </Box>

            {imagePreview && (
              <FormControl>
                <FormLabel>Caption</FormLabel>
                <Input
                  placeholder="Write a caption for your status..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </FormControl>
            )}
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isUploading || compressing}
            loadingText={compressing ? "Optimizing image..." : "Posting..."}
            isDisabled={!image || !caption.trim()}
          >
            Post Status
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
