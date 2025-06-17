import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useToast,
  Flex,
  Badge,
  Button,
  Spinner,
} from '@chakra-ui/react';
import axios from 'axios';
import { API_URL } from '../config';

const ChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please sign in to view chat history',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsLoadingChats(true);
      const response = await axios.get(`${API_URL}/api/chat/history`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });

      console.log('Chat history response:', response.data);
      setChatHistory(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch chat history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingChats(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Chat History</Heading>
          <Button
            colorScheme="blue"
            onClick={fetchChatHistory}
            isLoading={isLoadingChats}
            loadingText="Refreshing"
          >
            Refresh
          </Button>
        </Flex>

        <Box p={6} borderRadius="lg" boxShadow="md" bg="white">
          {isLoadingChats ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : chatHistory.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              No chat history available
            </Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {chatHistory.map((chat) => (
                <Box 
                  key={chat._id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md"
                  bg="gray.50"
                  _hover={{
                    bg: 'gray.100',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Flex justify="space-between" mb={2}>
                    <Badge colorScheme="blue">
                      {formatDate(chat.timestamp)}
                    </Badge>
                  </Flex>
                  <Box mb={2}>
                    <Text fontWeight="bold" color="blue.600">You:</Text>
                    <Text>{chat.message}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="green.600">Bot:</Text>
                    <Text>{chat.response}</Text>
                    {chat.translatedResponse && (
                      <Text mt={2} color="gray.600">
                        Translated: {chat.translatedResponse}
                      </Text>
                    )}
                  </Box>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default ChatHistory;