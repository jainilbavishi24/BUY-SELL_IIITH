

import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  Input,
  useToast,
  useColorModeValue,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  HStack,
  Text,
  Icon,
  Divider,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { useItemStore } from "../store/item";
import { PRODUCT_CATEGORIES, getCategoryIcon } from "../constants/categories";
import { FaImage, FaTag, FaRupeeSign } from "react-icons/fa";

const CreatePage = () => {
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subcategory: "",
    image: "",
  });

  const toast = useToast();
  const { createItem } = useItemStore();
  const boxBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const selectedCategory = PRODUCT_CATEGORIES.find(cat => cat.value === newItem.category);
  const subcategories = selectedCategory ? selectedCategory.subcategories : [];

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
      subcategory: "",
      image: "",
    });
  };

  return (
    <Container maxW={"container.md"} py={8}>
      <VStack spacing={8}>
        <VStack spacing={4} textAlign="center">
          <Heading
            as={"h1"}
            size={"2xl"}
            bgGradient="linear(to-r, brand.400, accent.400)"
            bgClip="text"
          >
            Create New Listing
          </Heading>
          <Text color={useColorModeValue("gray.600", "gray.400")} fontSize="lg">
            Share your items with the IIIT community
          </Text>
        </VStack>

        <Box
          w={"full"}
          bg={boxBg}
          p={8}
          borderRadius={"2xl"}
          boxShadow={"xl"}
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6}>
            {/* Product Name */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                <HStack>
                  <Icon as={FaTag} color="brand.500" />
                  <Text>Product Name</Text>
                </HStack>
              </FormLabel>
              <Input
                placeholder="Enter product name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                variant="filled"
                size="lg"
              />
            </FormControl>

            {/* Price */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                <HStack>
                  <Icon as={FaRupeeSign} color="green.500" />
                  <Text>Price</Text>
                </HStack>
              </FormLabel>
              <Input
                placeholder="Enter price in ₹"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                variant="filled"
                size="lg"
                type="number"
              />
            </FormControl>

            {/* Category Selection */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
              <FormControl>
                <FormLabel color={textColor} fontWeight="semibold">
                  Category
                </FormLabel>
                <Select
                  placeholder="Select category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value, subcategory: "" })}
                  variant="filled"
                  size="lg"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Subcategory Selection */}
              {subcategories.length > 0 && (
                <FormControl>
                  <FormLabel color={textColor} fontWeight="semibold">
                    Subcategory
                  </FormLabel>
                  <Select
                    placeholder="Select subcategory"
                    value={newItem.subcategory}
                    onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
                    variant="filled"
                    size="lg"
                  >
                    {subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </SimpleGrid>

            {/* Description */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                Description
              </FormLabel>
              <Textarea
                placeholder="Describe your product in detail..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                variant="filled"
                size="lg"
                rows={4}
              />
            </FormControl>

            {/* Image URL */}
            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold">
                <HStack>
                  <Icon as={FaImage} color="purple.500" />
                  <Text>Product Image</Text>
                </HStack>
              </FormLabel>
              <Input
                placeholder="Enter image URL"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                variant="filled"
                size="lg"
              />
            </FormControl>

            <Divider />

            {/* Category Preview */}
            {newItem.category && (
              <HStack spacing={2}>
                <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                  Category:
                </Text>
                <Badge colorScheme="brand" fontSize="sm">
                  {getCategoryIcon(newItem.category)} {selectedCategory?.label}
                </Badge>
                {newItem.subcategory && (
                  <Badge colorScheme="accent" fontSize="sm">
                    {newItem.subcategory}
                  </Badge>
                )}
              </HStack>
            )}

            <Button
              variant="gradient"
              onClick={handleNewItem}
              w="full"
              size="lg"
              isDisabled={!newItem.name || !newItem.price || !newItem.category}
            >
              Create Listing
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;