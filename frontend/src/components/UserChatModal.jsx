import React, { useState, useEffect, useRef } from "react";
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
  Spinner,
  List,
  ListItem,
  Badge,
  Flex,
  Button,
  Heading,
  useDisclosure
} from "@chakra-ui/react";
import { Send } from "lucide-react";

function getFullName(user) {
  if (user.fname && user.lname) return `${user.fname} ${user.lname}`;
  if (user.fname) return user.fname;
  if (user.lname) return user.lname;
  return user.email;
}

const UserChatModal = ({ isOpen, onClose, socket, activeConversationId, setActiveConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  // Fetch all users for starting new chats
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users);
        console.log("[CHAT] All users fetched for chat:", data.users);
      }
    } catch (e) {
      toast({ title: "Failed to load users", status: "error" });
    }
  };

  // When modal opens, fetch conversations and all users
  useEffect(() => {
    if (!isOpen) return;
    fetchConversations();
    fetchAllUsers();
  }, [isOpen]);

  // When modal closes, clear selected conversation and activeConversationId
  useEffect(() => {
    if (!isOpen) {
      setSelectedConv(null);
      setActiveConversationId && setActiveConversationId(null);
    }
  }, [isOpen, setActiveConversationId]);

  // Always fetch messages from backend when a conversation is selected
  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv._id);
      setActiveConversationId && setActiveConversationId(selectedConv._id);
    }
  }, [selectedConv, setActiveConversationId]);

  // Listen for incoming messages on the global socket
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (selectedConv && msg.conversationId === selectedConv._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setNotifications((prev) => [...prev, msg]);
      }
    };
    socket.on("chat:message", handler);
    return () => socket.off("chat:message", handler);
  }, [socket, selectedConv]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        // Auto-select conversation if activeConversationId is set
        if (isOpen && activeConversationId) {
          const conv = data.conversations.find((c) => c._id === activeConversationId);
          if (conv) {
            setSelectedConv(conv);
            fetchMessages(conv._id);
          }
        }
      }
    } catch (e) {
      toast({ title: "Failed to load conversations", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (e) {
      toast({ title: "Failed to load messages", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConv = (conv) => {
    setSelectedConv(conv);
    setMessages([]);
    fetchMessages(conv._id);
    setNotifications((prev) => prev.filter((msg) => msg.conversationId !== conv._id));
  };

  const handleSend = () => {
    if (!input.trim() || !selectedConv) return;
    socket && socket.emit("chat:message", {
      conversationId: selectedConv._id,
      text: input,
      sender: userId,
    });
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">User Chat</DrawerHeader>
        <DrawerBody>
          <Flex h="full" gap={6}>
            {/* Conversation List */}
            <Box w="300px" borderRight="1px solid #eee" pr={4} overflowY="auto">
              <HStack justify="space-between" mb={2}>
                <Heading size="sm">Conversations</Heading>
                <Button size="xs" colorScheme="blue" onClick={() => setShowUserList((v) => !v)}>
                  {showUserList ? "Hide Users" : "New Chat"}
                </Button>
              </HStack>
              {showUserList ? (
                <List spacing={2}>
                  {allUsers.length === 0 && <Text color="gray.500">No users found.</Text>}
                  {allUsers.map((user) => (
                    <ListItem
                      key={user._id}
                      p={2}
                      borderRadius="md"
                      bg="gray.50"
                      cursor="pointer"
                      _hover={{ bg: "blue.50" }}
                      onClick={async () => {
                        // Start or open conversation
                        setShowUserList(false);
                        setIsLoading(true);
                        try {
                          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/conversations`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ participantId: user._id }),
                          });
                          const data = await res.json();
                          if (data.success && data.conversation) {
                            fetchConversations();
                            setSelectedConv(data.conversation);
                          } else {
                            toast({ title: "Failed to start chat", status: "error" });
                          }
                        } catch (e) {
                          toast({ title: "Failed to start chat", status: "error" });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      <Text fontWeight="bold">{getFullName(user)}</Text>
                      <Text fontSize="sm" color="gray.500">{user.email}</Text>
                    </ListItem>
                  ))}
                </List>
              ) : isLoading ? <Spinner /> : (
                <List spacing={2}>
                  {conversations.map((conv) => (
                    <ListItem
                      key={conv._id}
                      p={2}
                      borderRadius="md"
                      bg={selectedConv && selectedConv._id === conv._id ? "blue.100" : "gray.50"}
                      cursor="pointer"
                      onClick={() => handleSelectConv(conv)}
                    >
                      <HStack justify="space-between">
                        <Text color="gray.800" fontWeight="bold">
                          {conv.participants
                            .filter(u => u._id !== userId)
                            .map(getFullName)
                            .join(", ")}
                        </Text>
                        {notifications.some((msg) => msg.conversationId === conv._id) && <Badge colorScheme="red">New</Badge>}
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            {/* Chat Window */}
            <VStack flex={1} align="stretch" spacing={4} h="full">
              {selectedConv ? (
                <>
                  <Box mb={2}>
                    <Text fontWeight="bold" fontSize="lg">
                      {getFullName(selectedConv.participants.find(u => u._id !== userId) || {})}
                    </Text>
                  </Box>
                  <Box flex={1} overflowY="auto" pb={4}>
                    {messages.map((msg, idx) => {
                      const isUser = msg.sender && (msg.sender._id === userId || msg.sender === userId);
                      return (
                        <Flex key={idx} justify={isUser ? "flex-end" : "flex-start"}>
                          <Box
                            bg={isUser ? "blue.500" : "gray.100"}
                            color={isUser ? "white" : "black"}
                            px={4}
                            py={3}
                            borderRadius={isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px"}
                            maxW="70%"
                            my={2}
                            boxShadow="sm"
                            fontSize="md"
                            wordBreak="break-word"
                          >
                            <Text whiteSpace="pre-line" fontSize="sm" lineHeight="1.5">
                              {msg.text}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Box>
                  <HStack w="full" spacing={2}>
                    <Input
                      placeholder="Type a message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    />
                    <IconButton
                      icon={<Send />}
                      onClick={handleSend}
                      isLoading={isLoading}
                      aria-label="Send message"
                      colorScheme="blue"
                    />
                  </HStack>
                </>
              ) : (
                <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.400">Select a conversation to start chatting</Text>
                </Box>
              )}
            </VStack>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default UserChatModal; 