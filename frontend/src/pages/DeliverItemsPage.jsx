import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  SimpleGrid,
  Box,
  Heading,
  Text,
  Input,
  Button,
  useColorModeValue,
  Divider,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";

const DeliverItemsPage = () => {
  const [orders, setOrders] = useState([]);
  const [otpInput, setOtpInput] = useState({});
  const sellerID = localStorage.getItem("userId");
  const textColor = useColorModeValue("gray.800", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentItem, setCurrentItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchSellerOrders();
  }, [sellerID]);

  const fetchSellerOrders = async () => {
    if (!sellerID) {
      console.error("Seller ID not found in local storage.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Token not found in local storage.");
      return;
    }

    try {
      const res = await fetch(
        `/api/seller/orders-with-buyer?sellerID=${sellerID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          console.error("Unauthorized access - possibly invalid token.");
          return;
        }
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const filteredOrders = data.orders
          .map((order) => ({
            ...order,
            items: order.items.filter(
              (item) =>
                item.sellerID === sellerID && item.status !== "Completed"
            ),
          }))
          .filter((order) => order.items.length > 0);

        setOrders(filteredOrders);
      } else {
        console.error(
          "Failed to fetch orders:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    }
  };

  const handleCompleteOrder = async (itemId, orderId) => {
    const otp = otpInput[itemId];

    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await fetch("/api/order/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ itemId, otp }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Order completed successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setOrders((prevOrders) => {
          const updatedOrders = prevOrders
            .map((order) => {
              if (order._id === orderId) {
                return {
                  ...order,
                  items: order.items.filter(
                    (item) => item.itemId._id !== itemId
                  ),
                };
              }
              return order;
            })
            .filter((order) => order.items.length > 0);

          return updatedOrders;
        });

        setOtpInput((prev) => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to complete the order.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to complete the order. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container
      maxW="container.xl"
      py={12}
      bgGradient="linear(to-r, teal.500, green.500)"
    >
      <VStack spacing={8}>
        <Heading as="h1" color="white">
          Deliver Items
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
          {orders.length > 0 ? (
            orders.map((order) => (
              <Box
                key={order._id}
                p={5}
                borderWidth={1}
                borderRadius="md"
                boxShadow="md"
                bg="white"
                color={textColor}
                _hover={{ bg: "gray.50" }}
              >
                <Heading size="md">Order ID: {order._id}</Heading>
                <Text mt={2} fontSize="lg">
                  Amount: ${order.amount}
                </Text>

                <Divider my={4} />
                <Heading size="sm" mb={3}>
                  Buyer Details
                </Heading>
                <Flex direction="column" gap={2}>
                  {order.userId ? (
                    <>
                      <Text>
                        <strong>Name:</strong> {order.userId.fname}{" "}
                        {order.userId.lname}
                      </Text>
                      <Text>
                        <strong>Email:</strong> {order.userId.email}
                      </Text>
                      <Text>
                        <strong>Contact:</strong> {order.userId.contactNo}
                      </Text>
                    </>
                  ) : (
                    <Text color="red">Buyer information not available</Text>
                  )}
                </Flex>
                <Divider my={4} />

                <SimpleGrid columns={1} spacing={4} mt={4}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <Box
                        key={item.itemId._id}
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        bg="gray.50"
                      >
                        <Text>
                          <strong>Item:</strong>{" "}
                          {item.itemId.name || "Unknown Item"}
                        </Text>
                        <Text>
                          <strong>Price:</strong> ${item.itemId.price || "N/A"}
                        </Text>
                        <Input
                          mt={2}
                          type="text"
                          placeholder="Enter OTP"
                          value={otpInput[item.itemId._id] || ""}
                          onChange={(e) =>
                            setOtpInput({
                              ...otpInput,
                              [item.itemId._id]: e.target.value,
                            })
                          }
                        />
                        <Button
                          colorScheme="teal"
                          onClick={() =>
                            handleCompleteOrder(item.itemId._id, order._id)
                          }
                          w="full"
                          display="flex" // Use flexbox
                          justifyContent="center" // Center horizontally
                          alignItems="center" // Center vertically
                          className="mx-auto" // Additional Tailwind centering
                        >
                          Complete Order
                        </Button>
                      </Box>
                    ))
                  ) : (
                    <Text>No items in this order.</Text>
                  )}
                </SimpleGrid>
              </Box>
            ))
          ) : (
            <Text color="white" fontSize="2xl">
              No orders to deliver.
            </Text>
          )}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default DeliverItemsPage;
