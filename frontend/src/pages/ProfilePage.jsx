import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Text,
  Icon,
  Input,
  Heading,
  VStack,
  useToast,
  Divider,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { FaKey, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import ChangePassword from "../components/ChangePassword";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    fname: "",
    lname: "",
    email: "",
    age: "",
    contactNo: "",
  });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const toast = useToast();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/${userId}/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setUserData({
            fname: data.user.fname || "",
            lname: data.user.lname || "",
            email: data.user.email || "",
            age: data.user.age || "",
            contactNo: data.user.contactNo || "",
          });
        }

        const reviewsRes = await fetch(`/api/user/${userId}/seller-reviews`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const reviewsData = await reviewsRes.json();
        if (reviewsData.success) {
          setSellerReviews(reviewsData.reviews);
        }
      } catch (error) {
        toast({
          title: "Error fetching profile.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchProfile();
  }, [toast, userId]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/user/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Profile updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error updating profile.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={8}>
        <VStack spacing={2}>
          <Heading size="lg" color={useColorModeValue("gray.800", "white")}>
            Profile Settings
          </Heading>
          <Text color={useColorModeValue("gray.600", "gray.400")}>
            Manage your account information and security
          </Text>
        </VStack>

        {/* Profile Information Section */}
        <Box
          w="full"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          borderRadius="xl"
          boxShadow="lg"
          border="1px"
          borderColor={useColorModeValue("gray.200", "gray.600")}
        >
          <VStack spacing={6}>
            <HStack spacing={3} w="full" justify="flex-start">
              <Icon as={FaUser} color="blue.500" />
              <Heading size="md">Personal Information</Heading>
            </HStack>

            <VStack spacing={4} w="full">
              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Text>First Name</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="fname"
                    value={userData.fname}
                    onChange={handleChange}
                    variant="filled"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    name="lname"
                    value={userData.lname}
                    onChange={handleChange}
                    variant="filled"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaEnvelope} boxSize={3} />
                      <Text>Email</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    variant="filled"
                    isReadOnly
                    bg={useColorModeValue("gray.100", "gray.700")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Age</FormLabel>
                  <Input
                    name="age"
                    type="number"
                    value={userData.age}
                    onChange={handleChange}
                    variant="filled"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaPhone} boxSize={3} />
                    <Text>Contact Number</Text>
                  </HStack>
                </FormLabel>
                <Input
                  name="contactNo"
                  value={userData.contactNo}
                  onChange={handleChange}
                  variant="filled"
                  placeholder="Enter your phone number for SMS notifications"
                />
              </FormControl>
            </VStack>

            <HStack spacing={4} w="full" justify="flex-end">
              <Button
                leftIcon={<Icon as={FaKey} />}
                variant="outline"
                colorScheme="orange"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Change Password
              </Button>
              <Button colorScheme="blue" onClick={handleUpdate}>
                Update Profile
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
      {sellerReviews.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            Seller Reviews
          </Heading>
          <VStack spacing={4} align="stretch">
            {sellerReviews.map((review, index) => (
              <Box key={index} p={4} borderWidth={1} borderRadius="md">
                <HStack spacing={2} mb={2}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={StarIcon}
                      color={i < review.rating ? "yellow.400" : "gray.200"}
                    />
                  ))}
                </HStack>
                <Text fontWeight="bold">Item: {review.itemName}</Text>
                <Text>{review.text}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </Container>
  );
};

export default ProfilePage;
