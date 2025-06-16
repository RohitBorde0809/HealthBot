import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  SimpleGrid,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactInfo = ({ icon, title, content }) => {
  return (
    <Flex
      align="center"
      p={4}
      bg="white"
      rounded="lg"
      shadow="md"
      _hover={{ transform: 'translateY(-2px)', transition: 'all 0.3s ease' }}
    >
      <Icon as={icon} w={6} h={6} color="blue.500" mr={4} />
      <Box>
        <Text fontWeight="bold">{title}</Text>
        <Text color="gray.600">{content}</Text>
      </Box>
    </Flex>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: 'Message sent!',
      description: "We'll get back to you soon.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Box py={10} bg="gray.50">
      <Container maxW="container.xl">
        <VStack spacing={10}>
          {/* Header */}
          <Box textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, blue.600)"
              bgClip="text"
              mb={4}
            >
              Contact Us
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
            </Text>
          </Box>

          {/* Contact Information */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
            <ContactInfo
              icon={FaEnvelope}
              title="Email"
              content="support@healthchat.com"
            />
            <ContactInfo
              icon={FaPhone}
              title="Phone"
              content="+1 (555) 123-4567"
            />
            <ContactInfo
              icon={FaMapMarkerAlt}
              title="Location"
              content="123 Health Street, Medical City, MC 12345"
            />
          </SimpleGrid>

          {/* Contact Form */}
          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            p={8}
            rounded="xl"
            shadow="lg"
            w="full"
            maxW="2xl"
          >
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Subject</FormLabel>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  rows={6}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                Send Message
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Contact; 