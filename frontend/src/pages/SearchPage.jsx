import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  VStack,
  Text,
  Heading,
  SimpleGrid,
  Checkbox,
  CheckboxGroup,
  Stack,
  Input,
  Image,
  InputGroup,
  InputLeftElement,
  Box,
  Flex,
  Badge,
  useColorModeValue,
  Wrap,
  WrapItem,
  Button,
  Icon,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { PRODUCT_CATEGORIES, getCategoryIcon, getCategoryLabel } from "../constants/categories";
import { FaFilter, FaRupeeSign } from "react-icons/fa";

const SearchPage = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();


  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("md", "dark-lg");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    // Relist expired carted items on every marketplace load
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/relist-expired-carted-items`, { method: "POST" });
    const fetchItems = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/items`);
        const data = await res.json();
        setItems(data.items);


        const vendorData = {};
        for (let item of data.items) {
          const vendorRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${item.sellerID}`);
          const vendor = await vendorRes.json();
          vendorData[item.sellerID] = vendor.data;
        }
        setVendors(vendorData);




      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleCategoryChange = (categories) => {
    setSelectedCategories(categories);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearchTerm = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        
      <Text
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          fontSize="6xl"
          fontWeight="extrabold"
          justifyContent={"center"}
          display={"flex"}
          
        >
          Available Products
        </Text>

        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          gap={4}
        >
          {/* Search Input with Magnifying Glass Icon */}
          <InputGroup flex={3} mr={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="filled"
            />
          </InputGroup>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategories([]);
              setSearchTerm("");
            }}
            size="md"
          >
            Clear Filters
          </Button>
        </Flex>

        {/* Category Filter Section */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Icon as={FaFilter} color="brand.500" />
            <Heading size="md" color={useColorModeValue("gray.700", "gray.300")}>
              Filter by Category
            </Heading>
          </HStack>

          <CheckboxGroup colorScheme="brand" onChange={handleCategoryChange} value={selectedCategories}>
            <Wrap spacing={3}>
              {PRODUCT_CATEGORIES.map((category) => (
                <WrapItem key={category.value}>
                  <Checkbox
                    value={category.value}
                    size="lg"
                    colorScheme="brand"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="lg">{category.icon}</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {category.label}
                      </Text>
                    </HStack>
                  </Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </CheckboxGroup>
        </Box>

        <Divider />

        {/* Product Grid */}
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
          spacing={6}
        >
          {filteredItems.map((item) => (
            <Box
              key={item._id}
              bg={cardBg}
              boxShadow={cardShadow}
              borderRadius="lg"
              p={5}
              cursor={item.status === "sold" ? "not-allowed" : "pointer"}
              onClick={() => {
                if (item.status !== "sold") navigate(`/item/${item._id}`);
              }}
              _hover={item.status !== "sold" ? {
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
                boxShadow: "xl",
              } : {}}
            >
              <VStack align="stretch" spacing={3}>
              <Image
                  src={item.image}
                  alt={item.name}
                  borderRadius="md"
                  objectFit="cover"
                  w="100%" 
                  h={{ base: "150px", md: "200px" }} 
                />
                <Heading size="md" color={accentColor} noOfLines={1}>
                  {item.name}
                </Heading>
                <Badge colorScheme={
                  item.status === "available" ? "green" :
                  item.status === "reserved" ? "yellow" : "red"
                }>
                  {item.status === "available" ? "Available" :
                   item.status === "reserved" ? "Reserved" : "Sold"}
                </Badge>

                {/* Category Badge */}
                <HStack spacing={2}>
                  <Badge colorScheme="brand" fontSize="xs">
                    {getCategoryIcon(item.category)} {getCategoryLabel(item.category)}
                  </Badge>
                </HStack>

                <Text color={textColor} noOfLines={2} fontSize="sm">
                  {item.description}
                </Text>

                {vendors[item.sellerID] && (
                  <Text fontSize="xs" color={textColor} fontWeight="medium">
                    Seller: {vendors[item.sellerID].fname}{" "}
                    {vendors[item.sellerID].lname}
                  </Text>
                )}

                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaRupeeSign} color="green.500" boxSize={4} />
                    <Text fontSize="xl" fontWeight="bold" color="green.500">
                      {item.price}
                    </Text>
                  </HStack>
                </Flex>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default SearchPage;
