import React, { useEffect, useState } from "react";
import { Box, Heading, Text, VStack, Button, useToast, Image, HStack, Badge, Card, CardBody, useColorModeValue } from "@chakra-ui/react";

const MyItemsPage = () => {
  const [myItems, setMyItems] = useState([]);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = (isActive) => useColorModeValue(isActive ? "green.400" : "gray.400", isActive ? "green.300" : "gray.600");
  const cardText = useColorModeValue("gray.800", "white");
  const badgeColor = (isActive) => isActive ? (useColorModeValue("green", "green")) : (useColorModeValue("gray", "gray"));
  const badgeBg = (isActive) => isActive ? (useColorModeValue("green.50", "green.900")) : (useColorModeValue("gray.100", "gray.700"));

  useEffect(() => {
    const fetchItems = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const res = await fetch(`/api/user/${userId}/items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (data.success) setMyItems(data.items);
    };

    fetchItems();
  }, []);

  const handleUnlist = async (itemId) => {
    try {
      const res = await fetch(`/api/order/item/${itemId}/unlist`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Item unlisted", status: "success" });
        setMyItems((prev) => prev.map(item => item._id === itemId ? { ...item, isActive: false } : item));
      } else {
        toast({ title: "Error", description: data.message, status: "error" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to unlist item.", status: "error" });
    }
  };

  const handleRelist = async (itemId) => {
    try {
      const res = await fetch(`/api/user/item/${itemId}/relist`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Item relisted", status: "success" });
        setMyItems((prev) => prev.map(item => item._id === itemId ? { ...item, isActive: true } : item));
      } else {
        toast({ title: "Error", description: data.message, status: "error" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to relist item.", status: "error" });
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const res = await fetch(`/api/user/item/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Item deleted", status: "success" });
        setMyItems((prev) => prev.filter((item) => item._id !== itemId));
      } else {
        toast({ title: "Error", description: data.message, status: "error" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item.", status: "error" });
    }
  };

  return (
    <Box p={4}>
      <Heading>My Items</Heading>
      <VStack spacing={4} mt={4}>
        {myItems.map((item) => (
          <Card key={item._id} w={{ base: "100%", md: "400px" }} boxShadow="lg" borderWidth={2} borderColor={cardBorder(item.isActive)} bg={cardBg}>
            <CardBody>
              <HStack spacing={4} align="flex-start">
                {item.image && (
                  <Image src={item.image} alt={item.name} boxSize="80px" objectFit="cover" borderRadius="md" />
                )}
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Text fontWeight="bold" fontSize="lg" color={cardText}>{item.name}</Text>
                    <Badge colorScheme={badgeColor(item.isActive)} bg={badgeBg(item.isActive)} fontSize="0.8em">
                      {item.isActive ? "ACTIVE" : "UNLISTED"}
                    </Badge>
                  </HStack>
                  <Text fontSize="md" color={cardText}>Price: <b>₹{item.price}</b></Text>
                </VStack>
              </HStack>
              <HStack mt={4} spacing={3}>
                {item.isActive ? (
                  <Button colorScheme="red" onClick={() => handleUnlist(item._id)}>
                    Remove/Unlist
                  </Button>
                ) : (
                  <Button colorScheme="green" onClick={() => handleRelist(item._id)}>
                    Relist
                  </Button>
                )}
                <Button colorScheme="gray" onClick={() => handleDelete(item._id)}>
                  Delete
                </Button>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
};

export default MyItemsPage;
