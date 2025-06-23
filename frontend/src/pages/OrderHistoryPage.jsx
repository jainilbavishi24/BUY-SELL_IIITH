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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardBody,
  Stack,
  Flex,
  Spinner
} from "@chakra-ui/react";
import { StarIcon, InfoIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaRupeeSign } from "react-icons/fa";

const MotionContainer = motion(Container);

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ title: "Authentication error", description: "Please log in again.", status: "error", duration: 3000, isClosable: true });
        setLoading(false);
        return;
      }

    try {
        const [buyerRes, sellerRes] = await Promise.all([
          fetch(`/api/order/history?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`/api/seller/pastorders?sellerID=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const buyerData = await buyerRes.json();
        if (buyerData.success) {
          setOrders(buyerData.orders);
        } else if (buyerData.message && buyerData.message !== "No orders found.") {
          toast({ title: "Error fetching your purchases", description: buyerData.message, status: "warning", duration: 3000, isClosable: true });
        }

        const sellerData = await sellerRes.json();
        if (sellerData.success) {
          const filteredOrders = sellerData.orders
          .map((order) => ({
            ...order,
            items: order.items.filter((item) => item.sellerID === userId),
          }))
          .filter((order) => order.items.length > 0);
        setSellerOrders(filteredOrders);
      } else {
          toast({ title: "Error fetching your sales", description: sellerData.message, status: "warning", duration: 3000, isClosable: true });
      }
    } catch (error) {
        toast({ title: "Error fetching orders", description: "A network error occurred.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, toast]);

  const handleCancelPurchase = async (orderId, itemId) => {
    try {
      const res = await fetch(`/api/order/order/${orderId}/cancel-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Purchase cancelled", status: "success" });
        // Refresh orders
        setOrders((prev) => prev.map(order =>
          order._id === orderId
            ? { ...order, items: order.items.map(item => item.itemId === itemId ? { ...item, status: "Cancelled" } : item) }
            : order
        ));
      } else {
        toast({ title: "Error", description: data.message, status: "error" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel purchase.", status: "error" });
    }
  };

  const renderSkeletons = () => (
    [...Array(3)].map((_, i) => (
      <Card key={i} width="100%" mt={4} variant="outline">
        <CardBody><Spinner /></CardBody>
      </Card>
    ))
  );

  const renderEmptyState = (message, buttonText, buttonAction) => (
    <VStack spacing={5} mt={20} textAlign="center">
      <Icon as={FaShoppingBag} w={12} h={12} color="gray.400" />
      <Heading size="md" color="gray.500">{message}</Heading>
      <Button colorScheme="brand" onClick={buttonAction}>{buttonText}</Button>
    </VStack>
  );

  const renderOrderCard = (order) => {
    // Determine order status: if all items are completed, show 'Completed', else 'Pending'
    const allCompleted = order.items.every(item => item.status === 'Completed');
    const orderStatus = allCompleted ? 'Completed' : 'Pending';
  return (
      <Card key={order._id} width="100%" mt={4} variant="outline">
        <CardBody>
          <Stack spacing="3">
            <Heading size='sm'>Order ID: {(order.transactionID || order._id).slice(0, 12)}...</Heading>
            <Divider />
            {order.items.map((item, idx) => (
                <Flex key={item._id || (item.itemId && item.itemId._id) || item.itemId || idx} justify="space-between" align="center">
                    <Text>{item.name || item.itemId.name}</Text>
        <HStack>
                      <Icon as={FaRupeeSign} />
                      <Text>{item.price || item.itemId.price}</Text>
                      {/* Show OTP if order/item is not completed */}
                      {item.status !== 'Completed' && localStorage.getItem(`otp_${item.itemId || item.itemId._id}`) && (
                        <Box ml={4} p={1} px={2} borderRadius="md" bg="gray.700" color="white" fontSize="sm">
                          OTP: {JSON.parse(localStorage.getItem(`otp_${item.itemId || item.itemId._id}`)).otp}
                        </Box>
                      )}
                      {/* Cancel Purchase button for pending items */}
                      {item.status === 'Pending' && (
                        <Button ml={4} colorScheme="red" size="sm" onClick={() => handleCancelPurchase(order._id, item.itemId._id || item.itemId)}>
                          Cancel Purchase
                            </Button>
                          )}
                            </HStack>
                </Flex>
            ))}
            <Divider />
            <Flex justify="space-between" fontWeight="bold">
                <Text>Total Amount</Text>
                <HStack><Icon as={FaRupeeSign} /><Text>{order.amount}</Text></HStack>
            </Flex>
            <Text>Status: <Text as="span" fontWeight="semibold" color={orderStatus === 'Completed' ? 'green.400' : 'orange.400'}>{orderStatus}</Text></Text>
          </Stack>
        </CardBody>
      </Card>
    );
  };

  return (
    <MotionContainer maxW="container.lg" py={8} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">Order History</Heading>
        <Tabs isFitted variant="enclosed-colored" colorScheme="brand">
          <TabList>
            <Tab>My Purchases</Tab>
            <Tab>My Sales</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loading ? renderSkeletons() : orders.length > 0 ? orders.map(renderOrderCard) : renderEmptyState("You haven't purchased any items yet.", "Start Shopping", () => navigate("/"))}
            </TabPanel>
            <TabPanel>
              {loading ? renderSkeletons() : sellerOrders.length > 0 ? sellerOrders.map(renderOrderCard) : renderEmptyState("You haven't sold any items yet.", "Sell an Item", () => navigate("/create"))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </MotionContainer>
  );
};

export default OrderHistoryPage;
