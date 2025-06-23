import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  useColorModeValue,
  IconButton,
  HStack,
  useColorMode,
} from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
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
  const { colorMode, toggleColorMode } = useColorMode();

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
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
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("gray.50", "gray.900")}
      p={4}
    >
      <Box
        w="100%"
        maxW="450px"
        p={8}
        bg={useColorModeValue("white", "gray.800")}
        borderWidth={1}
        borderColor={useColorModeValue("gray.200", "gray.600")}
        borderRadius="xl"
        boxShadow="2xl"
        mx="auto"
      >
        <VStack spacing={6}>
          <HStack w="full" justify="space-between" align="center">
            <Heading textAlign="center" flex="1">Login</Heading>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
          </HStack>

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

      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </Box>
  );
};

export default LoginPage;
