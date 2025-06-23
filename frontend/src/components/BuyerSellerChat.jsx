import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  List,
  ListItem,
  Spinner,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import apiClient from "../api"; // Make sure this import is at the top with correct path

// This component is now much simpler. It receives all its data and does not fetch or manage state.
const BuyerSellerChat = ({
  socket,
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
  openNewChatModal,
}) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const userId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);
  
  // Effect 1: Check for pending conversation from localStorage
  useEffect(() => {
    const pendingConversationId = localStorage.getItem("pendingConversationId");
    if (pendingConversationId && conversations.length > 0) {
      const convoToSelect = conversations.find(c => c._id === pendingConversationId);
      if (convoToSelect && convoToSelect._id !== selectedConversation?._id) {
        onSelectConversation(convoToSelect);
        localStorage.removeItem("pendingConversationId");
      }
    }
  }, [conversations, selectedConversation, onSelectConversation]);

  // Effect 2: Fetch messages only when the selected conversation changes
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await apiClient.get(`/api/chat/messages/${selectedConversation._id}`);
        if (res.data.success) setMessages(res.data.messages);
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  // Effect 3: Listen for live messages on the socket
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.conversation === selectedConversation?._id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on("chat:message", handler);
    return () => {
      socket.off("chat:message", handler);
    };
  }, [socket, selectedConversation]);

  // Effect 4: Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !socket) return;
    const other = selectedConversation.participants.find(p => p._id !== userId);
    socket.emit("chat:message", {
      conversationId: selectedConversation._id,
      sender: userId,
      receiver: other._id,
      content: messageInput
    });
    setMessageInput("");
  };

  const isMyMessage = (msg) => (msg.sender && (msg.sender._id === userId || msg.sender === userId));

  return (
    <HStack spacing={0} align="stretch" h="400px" w="full">
      {/* Conversation List */}
      <VStack w="40%" bg={useColorModeValue("gray.100", "gray.800")} p={2} borderRightWidth={1}>
        <HStack justify="space-between" w="full" mb={2}>
          <Text fontWeight="bold">Conversations</Text>
          <Button size="xs" colorScheme="blue" onClick={openNewChatModal}>Start New</Button>
        </HStack>
        {loading ? <Spinner /> : (
          <List spacing={1} overflowY="auto" w="full">
            {conversations.length === 0 ? (
              <Text color="gray.500" textAlign="center" p={4}>No conversations yet</Text>
            ) : (
              conversations.map(conv => {
                const other = conv.participants.find(p => p._id !== userId);
                return (
                  <ListItem
                    key={conv._id}
                    p={2}
                    borderRadius="md"
                    bg={selectedConversation?._id === conv._id ? "blue.100" : "transparent"}
                    _hover={{ bg: "blue.50", cursor: "pointer" }}
                    onClick={() => onSelectConversation(conv)}
                  >
                    <HStack>
                      <Avatar size="sm" name={other?.fname + " " + other?.lname} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{other?.fname} {other?.lname}</Text>
                        <Text fontSize="xs" color="gray.500">{other?.email}</Text>
                      </VStack>
                    </HStack>
                  </ListItem>
                );
              })
            )}
          </List>
        )}
      </VStack>
      {/* Message Area */}
      <VStack w="60%" p={2} h="full" align="stretch">
        {selectedConversation ? (
          <>
            <Box flex={1} overflowY="auto" pr={2}>
              {loadingMessages ? <Spinner /> : (
                <VStack spacing={2} align="stretch">
                  {messages.length === 0 ? (
                    <Text color="gray.500" textAlign="center" p={4}>No messages yet</Text>
                  ) : (
                    messages.map((msg, idx) => {
                      const mine = isMyMessage(msg);
                      return (
                        <Box
                          key={msg._id || idx}
                          alignSelf={mine ? "flex-end" : "flex-start"}
                          maxW="70%"
                          bg={mine ? "blue.500" : "gray.200"}
                          color={mine ? "white" : "black"}
                          p={3}
                          borderRadius="lg"
                          wordBreak="break-word"
                        >
                          <Text>{msg.content}</Text>
                        </Box>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </VStack>
              )}
            </Box>
            <Divider />
            <HStack>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              />
              <Button colorScheme="blue" onClick={handleSendMessage}>Send</Button>
            </HStack>
          </>
        ) : (
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Select a conversation to start chatting.</Text>
          </Box>
        )}
      </VStack>
    </HStack>
  );
};

export default BuyerSellerChat; 