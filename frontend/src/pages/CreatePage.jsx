

import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  Input,
  useToast,
  useColorModeValue
} from "@chakra-ui/react";
import { useState } from "react";
import { useItemStore } from "@/store/item";

const CreatePage = () => {
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  const toast = useToast();
  const { createItem } = useItemStore();
  const boxBg = useColorModeValue("white", "gray.700"); 
  const textColor = useColorModeValue("black", "white"); 

  const userId = localStorage.getItem('userId');

  const handleNewItem = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create items",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    const itemData = {
      ...newItem,
      sellerID: userId,
    };

    const { success, message } = await createItem(itemData);

    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }

    setNewItem({
      name: "",
      price: "",
      description: "",
      category: "",
      image: "",
    });
  };

  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
          Create Item
        </Heading>

        <Box w={"full"} bg={boxBg} p={8} borderRadius={"lg"} boxShadow={"lg"}>
          <VStack spacing={4}>
            <Input
              placeholder={"Name"}
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              bg={boxBg}
              color={textColor}
            />
            <Input
              placeholder={"Price"}
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              bg={boxBg}
              color={textColor}
            />
            <Input
              placeholder={"Description"}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              bg={boxBg}
              color={textColor}
            />
            <Input
              placeholder={"Category"}
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              bg={boxBg}
              color={textColor}
            />
            {/* Removed Seller ID input */}
            <Input
              placeholder={"Image URL"}
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              bg={boxBg}
              color={textColor}
            />
            <Button colorScheme={"teal"} onClick={handleNewItem} w="full">
              Create
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;