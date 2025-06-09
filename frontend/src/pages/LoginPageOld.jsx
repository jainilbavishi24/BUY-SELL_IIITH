import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Container,
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "../components/ForgotPassword";

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const recaptchaRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIIITLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const serviceURL = encodeURIComponent(
      `${backendUrl}/api/auth/cas/callback`
    );
    window.location.href = `https://login.iiit.ac.in/cas/login?service=${serviceURL}`;
  };

  const handleLogin = async () => {
    const recaptchaToken = recaptchaRef.current.getValue();

    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Verification",
        description: "Please complete the reCAPTCHA verification",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          recaptchaToken,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.user._id);

        onLogin();

        toast({
          title: "Login Successful",
          description: "Welcome back!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Smart redirect logic
        if (data.user.isNewUser || !data.user.isProfileComplete) {
          // New user or incomplete profile -> redirect to profile page
          navigate("/profile");
        } else {
          // Existing user with complete profile -> redirect to marketplace
          navigate("/");
        }
      } else {
        recaptchaRef.current.reset();

        toast({
          title: "Login Failed",
          description: data.message || "An unexpected error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container
      maxW="container.sm"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w="100%"
        maxW="400px"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="xl"
      >
        <VStack spacing={6}>
          <Heading textAlign="center">Login</Heading>

          <FormControl>
            <FormLabel>
              Email{" "}
              <Text as="span" color="red.500">
                *
              </Text>
            </FormLabel>
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              borderWidth="2px"
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              Password{" "}
              <Text as="span" color="red.500">
                *
              </Text>
            </FormLabel>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              borderWidth="2px"
            />
          </FormControl>

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6Ldf0VUrAAAAANHrMo1x4VlymE_hCLCkk2kXmICV"
          />

          <Button colorScheme="teal" onClick={handleLogin} w="full">
            Log In
          </Button>

          <Button colorScheme="green" w="full" onClick={handleIIITLogin}>
            IIIT Login
          </Button>

          {/* Forgot Password Link */}
          <Button
            variant="link"
            colorScheme="blue"
            size="sm"
            onClick={() => setIsForgotPasswordOpen(true)}
          >
            Forgot Password?
          </Button>

          <Text>
            Don't have an account?{" "}
            <Button
              variant="link"
              colorScheme="teal"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </Text>
        </VStack>
      </Box>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </Container>
  );
};

export default LoginPage;

//
