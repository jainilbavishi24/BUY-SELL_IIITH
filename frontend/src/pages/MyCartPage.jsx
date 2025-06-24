import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  Text,
  Heading,
  Button,
  Image,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  HStack,
  IconButton,
  Box
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { FaRupeeSign } from "react-icons/fa";

const MyCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const toast = useToast();
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpDetails, setOtpDetails] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");

      if (!userId || !token) {
        console.error("User ID or token missing");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load cart.");

        setCartItems(data.cart);
        setTotalCost(data.cart.reduce((acc, item) => acc + item.price, 0));
      } catch (error) {
        console.error("Failed to fetch cart:", error.message);
      }
    };

    fetchCart();
  }, []);

  const handleOrder = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("User ID not found in localStorage.");
      }

      const orderPayload = {
        userId,
        items: cartItems.map((item) => item._id),
      };

      console.log("Sending order payload:", orderPayload);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,

        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      if (data.success) {
        setOtpDetails(data.otpDetails);
        setOtpModalOpen(true);
        data.otpDetails.forEach((item) => {
          const otpData = {
            otp: item.otp,
            expiration: new Date().getTime() + 10 * 60 * 100,
          };
          console.log(`Storing OTP for item ${item.itemId}: ${item.otp}`);
          localStorage.setItem(`otp_${item.itemId}`, JSON.stringify(otpData));

          const storedOTP = localStorage.getItem(`otp_${item.itemId}`);
          console.log(`Retrieved OTP for item ${item.itemId}: ${storedOTP}`);
        });

        setCartItems([]);
        setTotalCost(0);

        await fetchCart();

        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to place order.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");
  
    if (!userId || !token) {
      console.error("User ID or token missing");
      return;
    }
  
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load cart.");
  
      setCartItems(data.cart);
      setTotalCost(data.cart.reduce((acc, item) => acc + item.price, 0));
    } catch (error) {
      console.error("Failed to fetch cart:", error.message);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();

      if (data.success) {
        setCartItems((prevItems) => {
          const updated = prevItems.filter((item) => item._id !== itemId);
          setTotalCost(updated.reduce((acc, item) => acc + item.price, 0));
          return updated;
        });
        toast({
          title: "Removed",
          description: "Item has been removed from your cart.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        <Text fontSize="6xl" fontWeight="extrabold">
          My Cart
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <VStack key={item._id} p={4} borderRadius="md" boxShadow="lg">
                <Image src={item.image} alt={item.name} />
                <Heading as="h3" size="lg">
                  {item.name}
                </Heading>
                <Text fontSize="lg"><FaRupeeSign style={{display:'inline', marginRight: 2}} />{item.price}</Text>
                <Button
                  colorScheme="red"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </Button>
              </VStack>
            ))
          ) : (
            <Text fontSize="2xl">Your cart is empty.</Text>
          )}
        </SimpleGrid>
        <Text fontSize="2xl" fontWeight="bold">
          Total Cost: <FaRupeeSign style={{display:'inline', marginRight: 2}} />{totalCost}
        </Text>
        <Button colorScheme="teal" onClick={handleOrder}>
          Final Order
        </Button>
      </VStack>

      {/* OTP Modal */}
      <Modal isOpen={otpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order OTPs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {otpDetails.map((item) => (
                <Box key={item.itemId} p={3} borderWidth={1} borderRadius="md" bg="gray.700">
                  <Text fontWeight="bold">Item ID: {item.itemId}</Text>
                  <HStack>
                    <Text>OTP: <b>{item.otp}</b></Text>
                    <IconButton
                      aria-label="Copy OTP"
                      icon={<CopyIcon />}
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(item.otp)}
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setOtpModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MyCartPage;
