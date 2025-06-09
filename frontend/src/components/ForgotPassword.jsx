import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  HStack,
  PinInput,
  PinInputField,
  useColorModeValue,
  Icon,
  Box,
} from "@chakra-ui/react";
import { FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");

  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMaskedPhone(data.phoneNumber);
        setStep(2);
        toast({
          title: "OTP Sent",
          description: `OTP sent to ${data.phoneNumber}`,
          status: "success",
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Password reset successfully! You can now login with your new password.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleClose();
      } else {
        toast({
          title: "Error",
          description: data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setMaskedPhone("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg={bg} border="1px" borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaLock} color="blue.500" />
            <Text>Reset Password</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6}>
            {step === 1 && (
              <>
                <Text textAlign="center" color="gray.600">
                  Enter your email address and we'll send an OTP to your registered phone number.
                </Text>
                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="filled"
                  />
                </FormControl>
              </>
            )}

            {step === 2 && (
              <>
                <Box textAlign="center">
                  <HStack justify="center" mb={2}>
                    <Icon as={FaPhone} color="green.500" />
                    <Text fontWeight="semibold">OTP Sent</Text>
                  </HStack>
                  <Text color="gray.600" fontSize="sm">
                    Enter the 6-digit OTP sent to {maskedPhone}
                  </Text>
                </Box>
                <FormControl>
                  <FormLabel textAlign="center">Enter OTP</FormLabel>
                  <HStack justify="center">
                    <PinInput
                      value={otp}
                      onChange={setOtp}
                      size="lg"
                      variant="filled"
                    >
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>New Password</FormLabel>
                  <HStack>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      variant="filled"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon as={showPassword ? FaEyeSlash : FaEye} />
                    </Button>
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="filled"
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {step === 1 && (
              <Button
                colorScheme="blue"
                onClick={handleSendOTP}
                isLoading={loading}
                loadingText="Sending..."
              >
                Send OTP
              </Button>
            )}
            {step === 2 && (
              <Button
                colorScheme="green"
                onClick={handleResetPassword}
                isLoading={loading}
                loadingText="Resetting..."
              >
                Reset Password
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ForgotPassword;
