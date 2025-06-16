import { Box, Flex, Button, Heading, Spacer, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({ isAuthenticated, onLogout }: NavbarProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      bg={bgColor} 
      px={4} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      width="100%"
      top={0}
      zIndex={1000}
    >
      <Flex h={16} alignItems="center" width="100%" mx="auto">
        <Heading size="md" as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
          HealthChat
        </Heading>
        <Spacer />
        {isAuthenticated ? (
          <Flex gap={4}>
            <Button as={RouterLink} to="/chat" variant="ghost">
              Chat
            </Button>
            <Button as={RouterLink} to="/profile" variant="ghost">
              Profile
            </Button>
            <Button onClick={onLogout} variant="outline" colorScheme="red">
              Logout
            </Button>
          </Flex>
        ) : (
          <Flex gap={4}>
            <Button as={RouterLink} to="/signin" variant="ghost">
              Sign In
            </Button>
            <Button as={RouterLink} to="/signup" colorScheme="blue">
              Sign Up
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar; 