import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

interface SignInProps {
  onAuth: (userData: any, token: string) => void;
}

const SignIn = ({ onAuth }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.token) {
        onAuth(response.data.user, response.data.token);
        toast({
          title: 'Success',
          description: 'Signed in successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to sign in. Please check your credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8}>
        <Heading>Sign In</Heading>
        <Box w="100%" as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </VStack>
        </Box>
        <Text>
          Don't have an account?{' '}
          <ChakraLink as={RouterLink} to="/signup" color="blue.500">
            Sign Up
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default SignIn; 