import { useState, useRef } from 'react';
import { 
  Avatar, 
  Box, 
  Heading, 
  Flex, 
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ProfileCard({ user, userInfo, onUpload }) {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const imageRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        onOpen();
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = () => {
    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleSave = () => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImage = getCroppedImg();
      onUpload(croppedImage);
      onClose();
      setSelectedImage(null);
      setCroppedImageUrl(null);
    }
  };

  return (
    <>
      <Flex bg="white" p={6} borderRadius="lg" borderWidth="1px" boxShadow="sm" align="center" gap={6}>
        <Box position="relative">
          <Avatar 
            src={userInfo.profilePic} 
            name={userInfo.displayName || user.email} 
            size="xl" 
          />
          <IconButton
            icon={<AddIcon />}
            isRound
            size="sm"
            position="absolute"
            bottom="0"
            right="0"
            bg="blue.500"
            color="white"
            _hover={{ bg: 'blue.600' }}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </Box>
        <Box flex="1">
          <Heading size="md">{userInfo.displayName || user.email}</Heading>
          <Text color="gray.500" fontSize="sm">{user.email}</Text>
        </Box>
      </Flex>

      {/* Cropping Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crop Profile Picture</ModalHeader>
          <ModalBody>
            {selectedImage && (
              <ReactCrop
                src={selectedImage}
                crop={crop}
                onChange={newCrop => setCrop(newCrop)}
                circularCrop
                aspect={1}
              >
                <img 
                  ref={imageRef} 
                  src={selectedImage} 
                  style={{ maxWidth: '100%' }} 
                  alt="Crop preview"
                />
              </ReactCrop>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
