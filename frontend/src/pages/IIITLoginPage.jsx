import React, { useEffect } from 'react';
import { 
  Container, 
  VStack, 
  Button, 
  Heading, 
  Text,
  useToast 
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

const IIITLoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket');

    if (ticket) {
      validateCASTicket(ticket);
    }
  }, []);

  const initiateCASSO = () => {
    const serviceUrl = encodeURIComponent(`${window.location.origin}/iiit-login`);
    const casLoginUrl = `https://login.iiit.ac.in/cas/login?service=${serviceUrl}`;
    window.location.href = casLoginUrl;
  };

  const validateCASTicket = async (ticket) => {
    try {
      const response = await fetch('/api/auth/cas-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticket, 
          service: `${window.location.origin}/iiit-login`
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user._id);

        onLogin();

        toast({
          title: "Login Successful",
          description: `Welcome, ${data.user.username}!`,
          status: "success",
          duration: 3000,
        });

        navigate('/profile');
      } else {
        toast({
          title: "Login Failed",
          description: data.message,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="md" centerContent py={10}>
      <VStack spacing={6}>
        <Heading>IIIT Login</Heading>
        <Button 
          colorScheme="green" 
          size="lg" 
          onClick={initiateCASSO}
        >
          Login with IIIT Account
        </Button>
        <Text>
          <Button 
            variant="link" 
            colorScheme="blue"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Text>
      </VStack>
    </Container>
  );
};

export default IIITLoginPage;