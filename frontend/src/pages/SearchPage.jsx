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
} from "@chakra-ui/react";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";

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
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        setItems(data.items);


        const vendorData = {};
        for (let item of data.items) {
          const vendorRes = await fetch(`/api/user/${item.sellerID}`);
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

          {/* Category Checkboxes */}
          <Box flex={1} w="full">
            <CheckboxGroup colorScheme="blue" onChange={handleCategoryChange}>
            <Stack
                spacing={2}
                direction={{ base: "column", md: "row" }}
                justify="center"
                align="center"
              >
                <Checkbox value="Electronics">Electronics</Checkbox>
                <Checkbox value="Books">Books</Checkbox>
                <Checkbox value="Clothing">Clothing</Checkbox>
                <Checkbox value="Home">Home</Checkbox>
              </Stack>
            </CheckboxGroup>
          </Box>
        </Flex>

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
              cursor="pointer"
              onClick={() => navigate(`/item/${item._id}`)}
              _hover={{
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
                boxShadow: "xl",
              }}
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
                <Heading size="md" color={accentColor}>
                  {item.name}
                </Heading>
                <Text color={textColor} noOfLines={2}>
                  {item.description}
                </Text>

                {vendors[item.sellerID] && (
                  <Text fontSize="sm" color={textColor} fontWeight="bold">
                    Vendor: {vendors[item.sellerID].fname}{" "}
                    {vendors[item.sellerID].lname}
                  </Text>
                )}

                <Flex justify="space-between" align="center">
                  <Badge colorScheme="green" fontSize="lg">
                    ${item.price}
                  </Badge>
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
