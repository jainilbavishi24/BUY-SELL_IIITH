import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Text,
  Input,
  Button,
  Divider,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box
} from "@chakra-ui/react";

const DeliverItemsPage = () => {
  const [orders, setOrders] = useState([]);
  const [otpInput, setOtpInput] = useState({});
  const sellerID = localStorage.getItem("userId");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentItem, setCurrentItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    expirePendingOrders().then(fetchSellerOrders);
  }, [sellerID]);

  const expirePendingOrders = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/expire-pending`, { method: "POST" });
    } catch (error) {
      // Ignore errors for now
    }
  };

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
        `${import.meta.env.VITE_BACKEND_URL}/api/seller/orders-with-buyer?sellerID=${sellerID}`,
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/complete`, {
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

        fetchSellerOrders(); // Refetch orders to update the list
        onClose(); // Close the modal
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

  const openModal = (item) => {
    setCurrentItem(item);
    onOpen();
  };

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        <Heading as="h1">Deliver Items</Heading>
        {orders.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
            {orders.map((order) => (
              <Card key={order._id} borderWidth={1} borderRadius="md" boxShadow="md">
                <CardBody>
                <Heading size="md">Order ID: {order._id}</Heading>
                <Text mt={2} fontSize="lg">
                    Amount: ₹{order.amount}
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

                  <Heading size="sm" mb={3}>
                    Items to Deliver
                  </Heading>
                  <VStack spacing={4} align="stretch">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <Box
                        key={item.itemId._id}
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                          bg={{ base: "gray.700", _light: "gray.50" }}
                      >
                        <Text>
                          <strong>Item:</strong>{" "}
                          {item.itemId?.name || "Unknown Item"}
                        </Text>
                        <Text>
                            <strong>Price:</strong> ₹{item.itemId?.price || "N/A"}
                        </Text>
                        <Button
                            mt={4}
                          colorScheme="teal"
                            onClick={() => openModal(item)}
                          w="full"
                        >
                          Complete Order
                        </Button>
                      </Box>
                    ))
                  ) : (
                    <Text>No items in this order.</Text>
                  )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
                </SimpleGrid>
          ) : (
          <Text fontSize="2xl">No orders to deliver.</Text>
          )}
      </VStack>

      {currentItem && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Complete Order</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                <strong>Item:</strong>{" "}
                {currentItem.itemId?.name || "Unknown Item"}
              </Text>
              <Text>
                <strong>Price:</strong> ₹{currentItem.itemId?.price || "N/A"}
              </Text>
              <Input
                mt={4}
                type="text"
                placeholder="Enter OTP"
                value={otpInput[currentItem.itemId._id] || ""}
                onChange={(e) =>
                  setOtpInput({
                    ...otpInput,
                    [currentItem.itemId._id]: e.target.value,
                  })
                }
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => handleCompleteOrder(currentItem.itemId._id, currentItem.orderId)}>
                Complete Order
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default DeliverItemsPage;
