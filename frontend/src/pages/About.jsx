import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  SimpleGrid,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FaHeartbeat, FaUserMd, FaRobot } from 'react-icons/fa';

const Feature = ({ icon, title, text }) => {
  return (
    <VStack
      p={6}
      bg="white"
      rounded="xl"
      shadow="lg"
      spacing={4}
      align="start"
      _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{text}</Text>
    </VStack>
  );
};

const About = () => {
  return (
    <Box py={10} bg="gray.50">
      <Container maxW="container.xl">
        <VStack spacing={10}>
          {/* Hero Section */}
          <Box textAlign="center" py={10}>
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
              mb={4}
            >
              About Health Chat
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              Your AI-powered health companion, providing instant medical guidance and support
              whenever you need it.
            </Text>
          </Box>

          {/* Features Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
            <Feature
              icon={FaHeartbeat}
              title="24/7 Health Support"
              text="Get instant answers to your health questions anytime, anywhere. Our AI is always ready to help."
            />
            <Feature
              icon={FaUserMd}
              title="Medical Expertise"
              text="Powered by advanced AI trained on medical knowledge, providing reliable health information."
            />
            <Feature
              icon={FaRobot}
              title="Smart Conversations"
              text="Natural, human-like interactions that make discussing health concerns comfortable and easy."
            />
          </SimpleGrid>

          {/* Mission Statement */}
          <Box bg="white" p={8} rounded="xl" shadow="md" w="full">
            <VStack spacing={4} align="start">
              <Heading size="lg">Our Mission</Heading>
              <Text fontSize="lg" color="gray.600">
                At Health Chat, we're committed to making healthcare information more accessible
                to everyone. Our AI-powered platform provides instant, reliable health guidance,
                helping you make informed decisions about your wellbeing.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default About; 