import React, { useState } from "react";
import {
  Box,
  IconButton,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { FaComments, FaTimes, FaUserFriends } from "react-icons/fa";
import ChatBot from "./ChatBot";
import UserChatModal from "./UserChatModal";

const FloatingChatBot = ({
  socket,
  isUserChatOpen,
  setIsUserChatOpen,
  activeConversationId,
  setActiveConversationId
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating User Chat Button */}
      <Box
        position="fixed"
        bottom="80px"
        right="20px"
        zIndex={1000}
      >
        <Tooltip
          label={isUserChatOpen ? "Close User Chat" : "Open User Chat"}
          placement="left"
        >
          <IconButton
            aria-label={isUserChatOpen ? "Close user chat" : "Open user chat"}
            icon={isUserChatOpen ? <FaTimes /> : <FaUserFriends />}
            onClick={() => setIsUserChatOpen(!isUserChatOpen)}
            size="lg"
            isRound
            colorScheme="green"
            _hover={{
              transform: "scale(1.1)",
            }}
            boxShadow="lg"
          />
        </Tooltip>
      </Box>

      {/* Floating Chat Button */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={1000}
      >
        <Tooltip
          label={isChatOpen ? "Close Chat" : "Open Chat Assistant"}
          placement="left"
        >
          <IconButton
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
            icon={isChatOpen ? <FaTimes /> : <FaComments />}
            onClick={() => setIsChatOpen(!isChatOpen)}
            size="lg"
            isRound
            colorScheme="blue"
            _hover={{
              transform: "scale(1.1)",
            }}
            boxShadow="lg"
          />
        </Tooltip>
      </Box>

      {/* Chat Component */}
      <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* User Chat Modal */}
      <UserChatModal
        isOpen={isUserChatOpen}
        onClose={() => setIsUserChatOpen(false)}
        socket={socket}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
      />
    </>
  );
};

export default FloatingChatBot;
