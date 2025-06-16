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

interface SignUpProps {
  onAuth: (userData: any, token: string) => void;
}

const SignUp = ({ onAuth }: SignUpProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !email || !password) {
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

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        username,
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
          description: 'Account created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create account. Please try again.',
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
        <Heading>Sign Up</Heading>
        <Box w="100%" as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
              />
            </FormControl>
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
                placeholder="Choose a password (min. 6 characters)"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Sign Up
            </Button>
          </VStack>
        </Box>
        <Text>
          Already have an account?{' '}
          <ChakraLink as={RouterLink} to="/signin" color="blue.500">
            Sign In
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default SignUp; 