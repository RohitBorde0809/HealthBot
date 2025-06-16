import { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Container,
  Text,
  Flex,
  useToast,
  Avatar,
  Spinner,
} from '@chakra-ui/react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatProps {
  user: any;
}

const Chat = ({ user }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data[0]?.messages || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/message',
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack h="calc(100vh - 200px)" spacing={4}>
        <Box
          flex={1}
          w="100%"
          overflowY="auto"
          p={4}
          borderRadius="md"
          bg="gray.50"
        >
          {messages.map((message, index) => (
            <Flex
              key={index}
              justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
              mb={4}
            >
              <Flex
                maxW="70%"
                bg={message.role === 'user' ? 'blue.500' : 'white'}
                color={message.role === 'user' ? 'white' : 'black'}
                p={3}
                borderRadius="lg"
                boxShadow="sm"
              >
                {message.role === 'assistant' && (
                  <Avatar
                    size="sm"
                    name="HealthBot"
                    src="/bot-avatar.png"
                    mr={2}
                  />
                )}
                <Text>{message.content}</Text>
              </Flex>
            </Flex>
          ))}
          {isLoading && (
            <Flex justify="center" my={4}>
              <Spinner />
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Flex w="100%" gap={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health-related question..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            colorScheme="blue"
            onClick={handleSend}
            isLoading={isLoading}
          >
            Send
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default Chat; 