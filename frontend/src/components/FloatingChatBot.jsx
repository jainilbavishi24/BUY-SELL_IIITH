import React, { useState } from "react";
import {
  Box,
  IconButton,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { FaComments, FaTimes } from "react-icons/fa";
import ChatBot from "./ChatBot";

const FloatingChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
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
    </>
  );
};

export default FloatingChatBot;
