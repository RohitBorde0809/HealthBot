import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Avatar,
  Divider,
  useToast,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import axios from 'axios';

interface ChatHistory {
  _id: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
}

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatHistory(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Avatar
            size="2xl"
            name={user.username}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            mb={4}
          />
          <Heading size="lg">{user.username}</Heading>
          <Text color="gray.500">{user.email}</Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Chat History
          </Heading>
          <Accordion allowMultiple>
            {chatHistory.map((chat) => (
              <AccordionItem key={chat._id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold">
                        Chat from {formatDate(chat.createdAt)}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={2}>
                    {chat.messages.map((message, index) => (
                      <Box
                        key={index}
                        bg={message.role === 'user' ? 'blue.50' : 'gray.50'}
                        p={3}
                        borderRadius="md"
                      >
                        <Text fontWeight="bold" mb={1}>
                          {message.role === 'user' ? 'You' : 'HealthBot'}
                        </Text>
                        <Text>{message.content}</Text>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          {formatDate(message.timestamp)}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile; 