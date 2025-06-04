


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Container, VStack, Text, Heading, Button, Image, useToast,Box, Flex
} from "@chakra-ui/react";

const ItemPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [vendor, setVendor] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch item details.");
        }

        const data = await res.json();
        if (data.success) {
          setItem(data.data);
          fetchVendor(data.data.sellerID);  
        } else {
          throw new Error(data.message || "Failed to fetch item details.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch item details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const fetchVendor = async (sellerID) => {
      try {
        const res = await fetch(`/api/user/${sellerID}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch vendor details.");
        }

        const data = await res.json();
        if (data.success) {
          setVendor(data.data);  
        } else {
          throw new Error(data.message || "Failed to fetch vendor details.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch vendor details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchItem();
  }, [id, toast]);

  const addToCart = async (itemId) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");

      if (!token || !userId) {
        toast({
          title: "Error",
          description: "You must be logged in to add items to the cart.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (item.sellerID === userId) {
        toast({
          title: "Action Denied",
          description: "You cannot add your own item to the cart.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const cartRes = await fetch(`/api/user/${userId}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const cartData = await cartRes.json();
      if (!cartRes.ok) {
        throw new Error(cartData.message || "Failed to fetch cart.");
      }
  
      const isItemAlreadyInCart = cartData.cart.some(cartItem => cartItem._id === itemId);
      if (isItemAlreadyInCart) {
        toast({
          title: "Already in Cart",
          description: "This item is already in your cart.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch(`/api/user/${userId}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item added to cart successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!item || !vendor) {
    return <Text>Loading...</Text>;
  }

  return (
    <Container 
      maxW="container.md" 
      py={12} 
      className="bg-gradient-to-br from-teal-50 to-green-50 min-h-screen"
    >
      <VStack 
        spacing={6} 
        align="stretch" 
        className="bg-white shadow-2xl rounded-xl p-8 transform transition-all hover:scale-[1.01]"
      >
        <Box className="flex flex-col items-center">
          <Image 
            src={item.image} 
            alt={item.name} 
            boxSize="300px" 
            objectFit="cover" 
            borderRadius="xl" 
            boxShadow="lg"
            className="mb-6 hover:scale-105 transition-transform"
          />
        </Box>

        <VStack spacing={4} align="stretch">
          <Heading 
            textAlign="center" 
            size="xl" 
            className="text-teal-700 mb-4 border-b-2 border-teal-200 pb-2"
          >
            {item.name}
          </Heading>

          <Flex justify="space-between" className="bg-gray-100 p-4 rounded-lg">
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="teal.600">Description</Text>
              <Text>{item.description}</Text>
            </Box>
          </Flex>

          <Flex 
            justify="space-between" 
            className="bg-gray-50 p-4 rounded-lg shadow-sm"
          >
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="teal.600">Price</Text>
              <Text fontSize="xl" fontWeight="semibold" color="green.600">
                ${item.price}
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="teal.600">Category</Text>
              <Text>{item.category}</Text>
            </Box>
          </Flex>

          <Box 
            bg="purple.50" 
            p={4} 
            borderRadius="lg" 
            className="shadow-md"
          >
            <Heading size="md" mb={3} color="purple.600">Vendor Details</Heading>
            <VStack align="stretch" spacing={2}>
              <Text>
                <strong>Name:</strong> {vendor.fname} {vendor.lname}
              </Text>
              <Text>
                <strong>Email:</strong> {vendor.email}
              </Text>
              <Text>
                <strong>Contact:</strong> {vendor.contactNo}
              </Text>
            </VStack>
          </Box>

          <Button 
            colorScheme="teal" 
            size="lg" 
            onClick={() => addToCart(item._id)}
            className="w-full hover:bg-teal-600 transition-colors duration-300"
          >
            Add to Cart
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default ItemPage;