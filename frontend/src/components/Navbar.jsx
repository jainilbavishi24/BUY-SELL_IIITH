import React from "react";
import { useState } from "react";
import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { Link,useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaShoppingCart,
  FaHistory,
  FaTruck,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import ChatBotIcon from "./ChatBotIcon";
import ChatBot from "./ChatBot";

const Navbar = ({ isAuth, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {

      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();

      
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");

     
      onLogout();

      
      window.location.href = data.casLogoutUrl;
    } catch (error) {
      console.error("Logout failed:", error);
      
      localStorage.clear();
      onLogout();
      navigate("/login");
    }
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <Container 
      maxW="full" 
      bg="purple.600" 
      color="white" 
      boxShadow="md" 
      className="sticky top-0 z-50 shadow-lg"
    >
      <Flex
        maxW="1140px"
        margin="auto"
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: "column", md: "row" }}
        className="py-3 px-4 md:flex-row flex-col"
      >
        {/* Logo Section */}
        <Flex 
          alignItems="center" 
          className="mb-3 md:mb-0 transition-transform duration-300 hover:scale-105"
        >
          <Box
            mr={4}
            fontSize="2xl"
            fontWeight="bold"
            bg="purple.500"
            p={2}
            borderRadius="full"
            className="animate-pulse hover:animate-none"
          >
            🛍️
          </Box>
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color="white"
            className="hover:text-purple-200 transition-colors duration-300"
          >
            <Link to={isAuth ? "/" : "/login"}>MarketPulse</Link>
          </Text>
        </Flex>

        {/* Navigation Links */}
        <HStack 
          spacing={6} 
          alignItems="center"
          className="space-x-4 md:space-x-6"
        >
          {isAuth && (
            <>
              {[
                { to: "/create", icon: FaPlus, text: null },
                { to: "/my-cart", icon: FaShoppingCart, text: "My Cart" },
                { to: "/order-history", icon: FaHistory, text: "Order History" },
                { to: "/deliver-items", icon: FaTruck, text: "Deliver Items" },
                { to: "/profile", icon: CgProfile, text: null },
              ].map(({ to, icon: Icon, text }) => (
                <Link to={to} key={to} className="group">
                  <Button
                    colorScheme="whiteAlpha"
                    color="white"
                    className="
                      transition-all 
                      duration-300 
                      group-hover:bg-purple-500/20 
                      group-hover:scale-105 
                      flex 
                      items-center 
                      gap-2
                    "
                  >
                    {text ? (
                      <>
                        {text} <Icon className="ml-2 group-hover:animate-bounce" />
                      </>
                    ) : (
                      <Icon className="hover:animate-pulse" />
                    )}
                  </Button>
                </Link>
              ))}
            </>
          )}

          <ChatBotIcon onClick={() => setIsChatOpen(true)} />
          <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

          {isAuth && (
            <Button
              colorScheme="red"
              onClick={handleLogout}
              className="
                transition-all 
                duration-300 
                hover:scale-110 
                hover:bg-red-600 
                shadow-md 
                hover:shadow-lg
              "
            >
              Logout
            </Button>
          )}
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;