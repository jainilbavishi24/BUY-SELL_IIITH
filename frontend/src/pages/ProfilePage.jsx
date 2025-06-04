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
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    contactNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
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
            fname: data.user.fname,
            lname: data.user.lname,
            age: data.user.age,
            contactNo: data.user.contactNo,
            password: "",
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
      <VStack spacing={6}>
        <Heading>Profile Page</Heading>
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input name="fname" value={userData.fname} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Input name="lname" value={userData.lname} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Age</FormLabel>
          <Input name="age" type="number" value={userData.age} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Contact Number</FormLabel>
          <Input name="contactNo" value={userData.contactNo} onChange={handleChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input name="password" type="password" value={userData.password} onChange={handleChange} />
        </FormControl>
        <Button colorScheme="teal" onClick={handleUpdate}>
          Update Profile
        </Button>
      </VStack>
      {sellerReviews.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>Seller Reviews</Heading>
          <VStack spacing={4} align="stretch">
            {sellerReviews.map((review, index) => (
              <Box key={index} p={4} borderWidth={1} borderRadius="md">
                <HStack spacing={2} mb={2}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={StarIcon}
                      color={i < review.rating ? 'yellow.400' : 'gray.200'}
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
    </Container>
  );
};

export default ProfilePage;
