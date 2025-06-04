import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  Icon,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';

const ReviewModal = ({ isOpen, onClose, onSubmit, itemName }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const handleSubmit = () => {

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!text.trim()) {
      alert("Please write a review");
      return;
    }

    onSubmit(rating, text);
  };


  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setText("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review {itemName}</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text>Rate your experience:</Text>
            <HStack spacing={2}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  as={StarIcon}
                  boxSize={6}
                  color={star <= rating ? "yellow.400" : "gray.200"}
                  cursor="pointer"
                  onClick={() => setRating(star)}
                />
              ))}
            </HStack>
            <Text>{rating > 0 ? `Selected rating: ${rating}` : "No rating selected"}</Text>
            <Textarea
              placeholder="Write your review..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReviewModal;