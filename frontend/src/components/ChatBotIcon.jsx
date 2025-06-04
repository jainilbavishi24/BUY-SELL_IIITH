import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { MessageCircle } from 'lucide-react';

const ChatBotIcon = ({ onClick }) => {
  return (
    <IconButton
      icon={<MessageCircle />}
      isRound
      position="fixed"
      bottom="4"
      right="4"
      size="lg"
      colorScheme="blue"
      onClick={onClick}
      aria-label="Open Chat"
      boxShadow="lg"
      zIndex={1000}
    />
  );
};

export default ChatBotIcon;