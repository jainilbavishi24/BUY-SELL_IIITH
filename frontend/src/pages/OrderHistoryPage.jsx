

import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Box,
  Divider,
  Button,
  HStack,
  Icon,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("buyer");
  const [orders, setOrders] = useState([]);
  const [reviewStates, setReviewStates] = useState({});
  const [reviewedItems, setReviewedItems] = useState(new Set());

  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [otpStates, setOtpStates] = useState({});
  const userId = localStorage.getItem("userId");
  const textColor = useColorModeValue("gray.800", "white");
  const [visibleOTPs, setVisibleOTPs] = useState({});
  const [regeneratingOTP, setRegeneratingOTP] = useState({});
  const toast = useToast();

  useEffect(() => {
    const loadReviewedItems = () => {
      const savedReviews = localStorage.getItem(`reviewed_items_${userId}`);
      if (savedReviews) {
        setReviewedItems(new Set(JSON.parse(savedReviews)));
      }
    };
    const fetchExistingReviews = async () => {
      try {
        const response = await fetch("/api/reviews/check-reviewed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            userId,
            itemIds: sellerOrders.map((order) => order.itemId),
          }),
        });

        const data = await response.json();
        if (data.success && data.reviewedItems) {
          const newReviewedItems = new Set(data.reviewedItems);
          setReviewedItems(newReviewedItems);
          localStorage.setItem(
            `reviewed_items_${userId}`,
            JSON.stringify([...newReviewedItems])
          );
        }
      } catch (error) {
        console.error("Error fetching existing reviews:", error);
      }
    };

    fetchExistingReviews();
    fetchBuyerOrders();
    loadReviewedItems();
    fetchSellerOrders();
  }, [userId, sellerOrders]);

 

  const regenerateOTP = async (orderId, itemId) => {
    try {
      setRegeneratingOTP((prevState) => ({ ...prevState, [itemId]: true }));

      const response = await fetch("/api/order/regenerate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ orderId: orderId, itemId: itemId }), 
      });

      const data = await response.json();

      if (data.success) {
       
        const otpExpiration = new Date().getTime() + 60000; 
        localStorage.setItem(
          `otp_${itemId}`,
          JSON.stringify({ otp: data.otp, expiration: otpExpiration })
        );

       
        setOtpStates((prev) => ({ ...prev, [itemId]: data.otp }));
      } else {
        toast({
          title: data.error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error regenerating OTP:", error);
      toast({
        title: "Error regenerating OTP",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRegeneratingOTP((prevState) => ({ ...prevState, [itemId]: false }));
    }
  };

  const fetchBuyerOrders = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/order/history?userId=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
       
        const itemIds = data.orders.flatMap((order) =>
          order.items.map((item) => item.itemId)
        );
        await fetchExistingReviews(itemIds);
        setOrders(data.orders);
      } else {
        console.error(
          "Failed to fetch orders:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
    }
  };

  const fetchExistingReviews = async (itemIds) => {
    try {
      const response = await fetch("/api/reviews/check-reviewed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          userId,
          itemIds,
        }),
      });

      const data = await response.json();
      if (data.success && data.reviewedItems) {
        const newReviewedItems = new Set(data.reviewedItems);
        setReviewedItems(newReviewedItems);
        localStorage.setItem(
          `reviewed_items_${userId}`,
          JSON.stringify([...newReviewedItems])
        );
      }
    } catch (error) {
      console.error("Error fetching existing reviews:", error);
    }
  };

  const fetchSellerOrders = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/seller/pastorders?sellerID=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        const filteredOrders = data.orders
          .map((order) => ({
            ...order,
            items: order.items.filter((item) => item.sellerID === userId),
          }))
          .filter((order) => order.items.length > 0);
        setSellerOrders(filteredOrders);
      } else {
        console.error("Failed to fetch seller orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    }
  };

  const handleReviewClick = (itemId) => {
    if (reviewedItems.has(itemId)) return;
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        isWriting: true,
        rating: 0,
        text: "",
      },
    }));
  };

  const handleRatingClick = (itemId, rating) => {
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rating,
      },
    }));
  };

  const handleReviewTextChange = (itemId, text) => {
    setReviewStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        text,
      },
    }));
  };

  const handleSubmitReview = async (item) => {
    const reviewState = reviewStates[item.itemId];
    if (!reviewState) return;

    try {
      const reviewData = {
        userId: userId,
        itemId: item.itemId,
        sellerID: item.sellerID,
        text: reviewState.text,
        rating: reviewState.rating,
      };

      console.log("Review Data Sent:", reviewData);
      const response = await fetch("/api/reviews/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (data.success) {
        
        const newReviewedItems = new Set(reviewedItems);
        newReviewedItems.add(item.itemId);
        setReviewedItems(newReviewedItems);

        localStorage.setItem(
          `reviewed_items_${userId}`,
          JSON.stringify([...newReviewedItems])
        );

        toast({
          title: "Review submitted successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setReviewStates((prev) => {
          const newState = { ...prev };
          delete newState[item.itemId];
          return newState;
        });
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (error) {
      toast({
        title: "Error submitting review",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const ordersWithOTP = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      otp: localStorage.getItem(`otp_${item.itemId}`) || "N/A",
    })),
  }));

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        <Heading>Order History</Heading>

        {/* BUYER ORDERS SECTION */}
        <HStack>
          <Button
            colorScheme={activeTab === "buyer" ? "blue" : "gray"}
            onClick={() => setActiveTab("buyer")}
          >
            Buyer Orders
          </Button>
          <Button
            colorScheme={activeTab === "seller" ? "blue" : "gray"}
            onClick={() => setActiveTab("seller")}
          >
            Seller Orders
          </Button>
        </HStack>

        <Divider />
        {activeTab === "buyer" && (
          <Box w="full">
            <Heading size="lg" mb={4}>
              Orders as Buyer
            </Heading>
            <Divider mb={4} />
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={10}
              w="full"
            >
              {ordersWithOTP.length > 0 ? (
                ordersWithOTP.map((order) => (
                  <VStack
                    key={order._id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    color={textColor}
                    align="start"
                    bg="white"
                    boxShadow="sm"
                  >
                    <Text fontSize="xl" fontWeight="bold">
                      Order ID: {order._id}
                    </Text>
                    <Text>Amount: ${order.amount}</Text>
                    <Text>
                      Status:{" "}
                      {order.items.every((item) => item.status === "Completed")
                        ? "Completed"
                        : "Pending"}
                    </Text>
                    <Text fontWeight="bold">Items:</Text>
                    {order.items.map((item) => (
                      <Box
                        key={item.itemId}
                        w="100%"
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        mt={2}
                      >
                        <Text>Name: {item.name}</Text>
                        <Text>Price: ${item.price}</Text>
                        <Text>Status: {item.status}</Text>
                        <Text>
                          OTP:{" "}
                          {item.otp &&
                            (() => {
                              const storedOtp = JSON.parse(
                                localStorage.getItem(`otp_${item.itemId}`)
                              );
                              if (storedOtp) {
                                const currentTime = new Date().getTime();
                                if (storedOtp.expiration > currentTime) {
                                  return storedOtp.otp;
                                } else {
                                  return "OTP expired. Please regenerate.";
                                }
                              }
                              return "No OTP available.";
                            })()}
                        </Text>

                        {item.status !== "Completed" && (
                          <Button
                            mt={2}
                            colorScheme="orange"
                            size="sm"
                            isLoading={regeneratingOTP[item.itemId]}
                            onClick={() =>
                              regenerateOTP(order._id, item.itemId)
                            }
                          >
                            Regenerate OTP
                          </Button>
                        )}

                        {item.status === "Completed" &&
                          !reviewedItems.has(item.itemId) &&
                          !reviewStates[item.itemId]?.isWriting && (
                            <Button
                              mt={2}
                              colorScheme="teal"
                              size="sm"
                              onClick={() => handleReviewClick(item.itemId)}
                            >
                              Write Review
                            </Button>
                          )}

                        {reviewStates[item.itemId]?.isWriting && (
                          <VStack mt={3} align="start" spacing={3}>
                            <Text>Rate this item:</Text>
                            <HStack>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Icon
                                  key={star}
                                  as={StarIcon}
                                  color={
                                    star <= reviewStates[item.itemId].rating
                                      ? "yellow.400"
                                      : "gray.200"
                                  }
                                  cursor="pointer"
                                  onClick={() =>
                                    handleRatingClick(item.itemId, star)
                                  }
                                />
                              ))}
                            </HStack>
                            <Textarea
                              placeholder="Write your review here..."
                              value={reviewStates[item.itemId].text}
                              onChange={(e) =>
                                handleReviewTextChange(
                                  item.itemId,
                                  e.target.value
                                )
                              }
                            />
                            <Button
                              colorScheme="blue"
                              size="sm"
                              onClick={() => handleSubmitReview(item)}
                            >
                              Submit Review
                            </Button>
                          </VStack>
                        )}

                        {reviewedItems.has(item.itemId) && (
                          <Text color="green.500" mt={2}>
                            Review submitted
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ))
              ) : (
                <Text fontSize="2xl">No orders found.</Text>
              )}
            </SimpleGrid>
          </Box>
        )}

        {/* SELLER ORDERS SECTION */}
        {activeTab === "seller" && (
          <Box w="full">
            <Heading size="lg" mt={10} mb={4}>
              Orders as Seller
            </Heading>
            <Divider mb={4} />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
              {sellerOrders.length > 0 ? (
                sellerOrders.map((order) => (
                  <Box
                    key={order._id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    color={textColor}
                    bg="white"
                    boxShadow="sm"
                  >
                    <Text fontSize="xl" fontWeight="bold">
                      Order ID: {order._id}
                    </Text>
                    <Text>Amount: ${order.amount}</Text>
                    <Text>
                      Status:{" "}
                      {order.items.every((item) => item.status === "Completed")
                        ? "Completed"
                        : "Pending"}
                    </Text>
                    <Divider my={2} />
                    <Text fontWeight="bold">Items Sold:</Text>
                    {order.items.map((item) => (
                      <Box
                        key={item.itemId._id}
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        mt={2}
                      >
                        <Text>Name: {item.itemId.name}</Text>
                        <Text>Price: ${item.itemId.price}</Text>
                        <Text>Status: {item.status}</Text>
                      </Box>
                    ))}
                  </Box>
                ))
              ) : (
                <Text fontSize="lg">No orders found as a seller.</Text>
              )}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default OrderHistoryPage;
