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
  useColorModeValue,
  Icon,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

const ChangePassword = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
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
        description: "New passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Password changed successfully!",
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
        description: "Failed to change password. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg={bg} border="1px" borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaKey} color="orange.500" />
            <Text>Change Password</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6}>
            <Text textAlign="center" color="gray.600" fontSize="sm">
              Enter your current password and choose a new secure password.
            </Text>

            <FormControl>
              <FormLabel>Current Password</FormLabel>
              <InputGroup>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  variant="filled"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    icon={<Icon as={showCurrentPassword ? FaEyeSlash : FaEye} />}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="filled"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    icon={<Icon as={showNewPassword ? FaEyeSlash : FaEye} />}
                  />
                </InputRightElement>
              </InputGroup>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Password must be at least 6 characters long
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Confirm New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="filled"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon={<Icon as={showConfirmPassword ? FaEyeSlash : FaEye} />}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleChangePassword}
              isLoading={loading}
              loadingText="Changing..."
            >
              Change Password
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangePassword;
