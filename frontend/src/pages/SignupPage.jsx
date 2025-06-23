import React, { useState } from "react";
import {
  VStack,
  Input,
  Button,
  Heading,
  Text,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  useColorModeValue,
  IconButton,
  HStack,
  useColorMode,
  Divider,
} from "@chakra-ui/react";
import { FaMoon, FaSun, FaUserPlus, FaUniversity } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    age: "",
    contactNo: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach(key => {
      if (!formData[key]) {
        newErrors[key] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Account Created",
          description: "You can now log in!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate("/login");
      } else {
        if (data.message.includes("Email already exists")) {
          setErrors(prev => ({ ...prev, email: "Email already in use. Please sign in." }));
          toast({
            title: "Signup Failed",
            description: "An account with this email already exists.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Error",
            description: data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      w="100vw"
      minh="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("gray.50", "gray.900")}
      p={4}
      overflowY="auto"
    >
      <Box
        maxW="450px"
        p={8}
        bg={useColorModeValue("white", "gray.800")}
        borderWidth={1}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        borderRadius="2xl"
        boxShadow="2xl"
      >
        <VStack spacing={6} align="stretch">
          <HStack w="full" justify="space-between" align="center">
            <Heading
              bgGradient="linear(to-r, blue.500, purple.400)"
              bgClip="text"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="extrabold"
              flex="1"
              textAlign="center"
            >
              Create an Account
            </Heading>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
          </HStack>

          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.fname} isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
                borderWidth="2px"
                size="md"
                autoComplete="given-name"
              />
              <FormErrorMessage>{errors.fname}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.lname} isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
                borderWidth="2px"
                size="md"
                autoComplete="family-name"
              />
              <FormErrorMessage>{errors.lname}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                borderWidth="2px"
                size="md"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.age} isRequired>
              <FormLabel>Age</FormLabel>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                borderWidth="2px"
                size="md"
              />
              <FormErrorMessage>{errors.age}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.contactNo} isRequired>
              <FormLabel>Contact Number</FormLabel>
              <Input
                name="contactNo"
                value={formData.contactNo}
                onChange={handleInputChange}
                borderWidth="2px"
                size="md"
                autoComplete="tel"
              />
              <FormErrorMessage>{errors.contactNo}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                borderWidth="2px"
                size="md"
                autoComplete="new-password"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
          </VStack>

          <Button
            leftIcon={<FaUserPlus />}
            colorScheme="blue"
            size="lg"
            w="full"
            mt={2}
            fontWeight="bold"
            onClick={handleSignup}
            boxShadow="md"
          >
            Sign Up
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default SignupPage;