import React from "react";
import {
  Button,
  Container,
  Flex,
  HStack,
  Text,
  Box,
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaShoppingCart,
  FaHistory,
  FaTruck,
  FaMoon,
  FaSun,
  FaBoxOpen
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const Navbar = ({ isAuth, onLogout }) => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const brandGradient = useColorModeValue(
    "linear(to-r, brand.500, accent.500)",
    "linear(to-r, brand.400, accent.400)"
  );

  const handleLogout = async () => {
    try {

      const response = await fetch("/api/auth/logout", {
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



  return (
    <Box
      w="100vw"
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.800", "white")}
      boxShadow="md"
      borderBottom="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl" px={4}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          w="full"
        >
          {/* Logo Section */}
          <Flex alignItems="center" flexShrink={0}>
            <Box
              mr={3}
              fontSize="xl"
              fontWeight="bold"
              bg={useColorModeValue("blue.500", "blue.400")}
              p={2}
              borderRadius="full"
            >
              🛍️
            </Box>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={useColorModeValue("gray.800", "white")}
            >
              <Link to={isAuth ? "/" : "/login"}>MarketPulse</Link>
            </Text>
          </Flex>

          {/* Center Navigation */}
          {isAuth && (
            <HStack spacing={3} alignItems="center" flex={1} justify="center">
              {[
                { to: "/create", icon: FaPlus, text: "Create" },
                { to: "/my-items", icon: FaBoxOpen, text: "My Items" },
                { to: "/my-cart", icon: FaShoppingCart, text: "Cart" },
                { to: "/order-history", icon: FaHistory, text: "Orders" },
                { to: "/deliver-items", icon: FaTruck, text: "Deliver" },
                { to: "/profile", icon: CgProfile, text: "Profile" },
              ].map(({ to, icon: Icon, text }) => (
                <Link to={to} key={to}>
                  <Tooltip label={text} placement="bottom">
                    <Button
                      variant="ghost"
                      size="sm"
                      px={3}
                      _hover={{
                        bg: useColorModeValue("gray.100", "gray.700"),
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s"
                    >
                      <Icon />
                      <Text ml={2} display={{ base: "none", lg: "block" }} fontSize="sm">
                        {text}
                      </Text>
                    </Button>
                  </Tooltip>
                </Link>
              ))}
            </HStack>
          )}

          {/* Spacer for non-authenticated users */}
          {!isAuth && <Box flex={1} />}

          {/* Right Controls */}
          <HStack spacing={3} alignItems="center" flexShrink={0}>
            {/* Theme Toggle */}
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
              _hover={{
                bg: useColorModeValue("gray.100", "gray.700"),
                transform: "rotate(180deg)",
              }}
              transition="all 0.3s"
            />

            {isAuth && (
              <Button
                colorScheme="red"
                size="sm"
                onClick={handleLogout}
                px={4}
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s"
              >
                <Text display={{ base: "none", sm: "block" }}>Logout</Text>
                <Text display={{ base: "block", sm: "none" }}>🚪</Text>
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;