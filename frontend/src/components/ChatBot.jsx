import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  VStack,
  HStack,
  Text,
  Box,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { Send } from 'lucide-react';

const ChatMessage = ({ message, isUser }) => (
  <Box
    alignSelf={isUser ? 'flex-end' : 'flex-start'}
    bg={isUser ? 'blue.500' : 'gray.100'}
    color={isUser ? 'white' : 'black'}
    px={4}
    py={3}
    borderRadius="lg"
    maxW="85%"
    my={2}
    boxShadow="sm"
  >
    <Text whiteSpace="pre-line" fontSize="sm" lineHeight="1.5">
      {message}
    </Text>
  </Box>
);

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    setMessages([{
      text: "Hi! I'm your Buy-Sell IIITH assistant! 🎓\n\nI'm here to help you with our marketplace platform designed specifically for the IIIT Hyderabad community.\n\nI can help you with:\n• Buying and selling items\n• Managing your profile\n• Understanding platform features\n• Navigating the marketplace\n• Account and security questions\n• IIIT CAS login and authentication\n\nWhat would you like to know about our IIIT marketplace?",
      isUser: false
    }]);
    scrollToBottom();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { text: data.response, isUser: false }]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Chat Support</DrawerHeader>

        <DrawerBody>
          <VStack h="full" spacing={4}>
            <Box flex="1" w="full" overflowY="auto" pb={4}>
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg.text} isUser={msg.isUser} />
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <HStack w="full" spacing={2}>
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <IconButton
                icon={<Send />}
                onClick={handleSend}
                isLoading={isLoading}
                aria-label="Send message"
                colorScheme="blue"
              />
            </HStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatBot;