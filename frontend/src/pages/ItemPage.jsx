import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Container,
  VStack,
  Text,
  Heading,
  Button,
  Image,
  useToast,
  Box,
  Flex,
  Spinner,
  HStack,
  useColorModeValue,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";
import { ChatContext } from "../App";

const ItemPage = () => {
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [isItemInCart, setIsItemInCart] = useState(false);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const userId = localStorage.getItem("userId");

  const textColor = useColorModeValue("gray.800", "gray.100");

  const { setIsUserChatOpen, setActiveConversationId } = useContext(ChatContext);

  useEffect(() => {
    const fetchItemAndSeller = async () => {
      setLoading(true);
      try {
        const itemRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items/${id}`);
        const itemData = await itemRes.json();

        if (itemData.success) {
          setItem(itemData.data);
          const sellerRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${itemData.data.sellerID}`);
          const sellerData = await sellerRes.json();
          if (sellerData.success) {
            setSeller(sellerData.data);
          }
        } else {
          toast({ title: "Error", description: "Item not found.", status: "error", duration: 3000, isClosable: true });
          navigate("/");
        }
      } catch (error) {
        toast({ title: "Error", description: "An error occurred while fetching item details.", status: "error", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };

    const checkCartStatus = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/cart`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });
        const data = await res.json();
        if (data.success) {
          const cartItemIds = data.cart.map(cartItem => cartItem._id);
          setIsItemInCart(cartItemIds.includes(id));
        }
      } catch (error) {
        console.error("Failed to check cart status", error);
      }
    };

    fetchItemAndSeller();
    checkCartStatus();
  }, [id, navigate, toast, userId]);

  const handleAddToCart = async (itemId) => {
    if (!userId) {
      toast({ title: "Please login to add items to your cart", status: "warning", duration: 3000, isClosable: true });
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Item added to cart", status: "success", duration: 2000, isClosable: true });
        setIsItemInCart(true);
      } else {
        toast({ title: "Error", description: data.message, status: "error", duration: 3000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not add item to cart.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleChatWithSeller = async () => {
    if (!seller || !seller._id || !userId) {
      toast({ title: "Seller info not loaded", status: "error" });
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let conversation = null;
      if (data.success) {
        conversation = data.conversations.find(conv =>
          conv.participants.some(p => p._id === seller._id)
        );
      }
      if (conversation) {
        setActiveConversationId(conversation._id);
        setIsUserChatOpen(true);
      } else {
        const createRes = await fetch(`/api/chat/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId: seller._id }),
        });
        const createData = await createRes.json();
        if (createData.success && createData.conversation) {
          setActiveConversationId(createData.conversation._id);
          setIsUserChatOpen(true);
        } else {
          toast({ title: "Failed to start chat", description: createData.message, status: "error" });
        }
      }
    } catch (e) {
      setIsUserChatOpen(true);
    }
  };

  const handleUnlist = async (itemId) => {
    try {
      const res = await fetch(`/api/user/item/${itemId}/unlist`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Item unlisted", status: "success" });
        setItem((prev) => ({ ...prev, isActive: false }));
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
        setItem((prev) => ({ ...prev, isActive: true }));
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
        navigate("/my-items");
      } else {
        toast({ title: "Error", description: data.message, status: "error" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item.", status: "error" });
    }
  };

  if (loading) {
    return <Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex>;
  }

  if (!item) {
    return <Flex justify="center" align="center" minH="80vh"><Heading>Item not found</Heading></Flex>;
  }

  return (
    <Container maxW={"container.xl"} py={12}>
      <Flex direction={{ base: "column", md: "row" }} gap={10}>
        <Box flex={1}>
          <Image 
            src={item.image} 
            alt={item.name} 
            borderRadius="lg"
            objectFit="cover" 
            w="100%"
            h="auto"
            maxH="500px"
            bg={useColorModeValue("gray.100", "gray.600")}
          />
        </Box>

        <VStack flex={1} align="stretch" spacing={5}>
          <Heading as="h1" size="2xl" fontWeight="bold" color={textColor}>
            {item.name}
          </Heading>

          <HStack align="center">
              <Icon as={FaRupeeSign} color="green.500" />
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                {item.price}
              </Text>
          </HStack>

            <Box>
            <Heading as="h2" size="lg" fontWeight="semibold" mb={3} color={textColor}>
              Description
            </Heading>
            <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")} whiteSpace="pre-wrap">
              {item.description}
            </Text>
            </Box>

          <Box>
            <Heading as="h2" size="lg" fontWeight="semibold" mb={3} color={textColor}>
              Seller Details
            </Heading>
            {seller ? (
            <VStack align="stretch" spacing={2}>
                <Text fontSize="lg" fontWeight="medium">
                  {seller.fname} {seller.lname}
              </Text>
            </VStack>
            ) : (
              <Spinner size="sm" />
            )}
          </Box>

          {seller && seller._id === userId ? (
            <VStack align="stretch" spacing={3} mt={4}>
              <HStack>
                <Badge colorScheme={item.isActive ? "green" : "gray"} fontSize="0.9em">
                  {item.isActive ? "ACTIVE" : "UNLISTED"}
                </Badge>
              </HStack>
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
            </VStack>
          ) : (
            <>
              <Button 
                leftIcon={<FaShoppingCart />} 
                colorScheme="brand" 
                variant="solid" 
                size="lg" 
                mt={4} 
                onClick={() => handleAddToCart(item._id)} 
                disabled={isItemInCart}
              >
                {isItemInCart ? "Added to Cart" : "Add to Cart"}
              </Button>
              {seller && seller._id !== userId && (
                <Button
                  colorScheme="green"
                  variant="outline"
                  size="lg"
                  mt={2}
                  onClick={handleChatWithSeller}
                >
                  Chat with Seller
                </Button>
              )}
            </>
          )}
        </VStack>
      </Flex>
    </Container>
  );
};

export default ItemPage;