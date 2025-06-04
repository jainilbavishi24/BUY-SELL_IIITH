import React, { useEffect, useState } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const MyItemsPage = () => {
  const [myItems, setMyItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(`/api/user/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (data.success) setMyItems(data.items);
    };

    fetchItems();
  }, []);

  return (
    <Box p={4}>
      <Heading>My Items</Heading>
      <VStack spacing={4} mt={4}>
        {myItems.map((item) => (
          <Box key={item._id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
            <Text fontWeight="bold">{item.name}</Text>
            <Text>Price: ${item.price}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default MyItemsPage;
