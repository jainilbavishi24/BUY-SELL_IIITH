import React, { useState } from "react";
import {
  Container,
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
  Flex
} from "@chakra-ui/react";
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

    if (formData.email && !formData.email.endsWith("iiit.ac.in")) {
      newErrors.email = "Only IIIT email addresses are allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch("/api/auth/signup", {
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
    <Container maxW="container.sm" py={12}>
      <VStack spacing={6}>
        <Heading>Create an Account</Heading>
        
        <FormControl isInvalid={!!errors.fname} isRequired>
          <FormLabel>First Name</FormLabel>
          <Input
            name="fname"
            value={formData.fname}
            onChange={handleInputChange}
            borderWidth="2px"
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
            list="email-suggestions"
            borderWidth="2px"
          />
          <datalist id="email-suggestions">
            <option value="@iiit.ac.in" />
          </datalist>
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
          />
          <FormErrorMessage>{errors.contactNo}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired>
          <FormLabel>Password </FormLabel>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="new-password"
            borderWidth="2px"
          />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Button colorScheme="teal" onClick={handleSignup} w="full">
          Sign Up
        </Button>

        <Text>
          Already have an account?{" "}
          <Button 
            onClick={() => navigate("/login")} 
            variant="link" 
            colorScheme="teal"
          >
            Log In
          </Button>
        </Text>
      </VStack>
    </Container>
  );
};

export default SignupPage;