import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import axios from 'axios';

const Profile = ({ user, onLogout }) => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    age: '',
    gender: '',
    medicalHistory: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please sign in to view profile',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      console.log('Fetching profile with token:', token);
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Profile response:', response.data);
      setProfile({
        username: response.data.user.username,
        email: response.data.user.email,
        age: response.data.user.age || '',
        gender: response.data.user.gender || '',
        medicalHistory: response.data.user.medicalHistory || ''
      });
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        toast({
          title: 'Error',
          description: 'Session expired. Please login again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else if (error.response?.status === 404) {
        toast({
          title: 'Error',
          description: 'Profile endpoint not found. Please check server configuration.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to fetch profile: ${error.response?.data?.message || error.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please sign in to update profile',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate required fields
      if (!profile.username || !profile.email) {
        toast({
          title: 'Error',
          description: 'Username and email are required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Format the data to match the server's expected format
      const updateData = {
        user: {  // Wrap the data in a user object
          username: profile.username.trim(),
          email: profile.email.trim(),
          ...(profile.age && profile.age.trim() !== '' && { age: parseInt(profile.age) }),
          ...(profile.gender && profile.gender.trim() !== '' && { gender: profile.gender.trim() }),
          ...(profile.medicalHistory && profile.medicalHistory.trim() !== '' && { medicalHistory: profile.medicalHistory.trim() })
        }
      };

      console.log('Sending update data to server:', updateData);
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Server response:', response.data);
      
      // Update local state with the response data
      if (response.data.user) {
        setProfile({
          username: response.data.user.username,
          email: response.data.user.email,
          age: response.data.user.age || '',
          gender: response.data.user.gender || '',
          medicalHistory: response.data.user.medicalHistory || ''
        });
      }

      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Update error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data,
        requestData: error.config?.data
      });

      if (error.response?.status === 401) {
        toast({
          title: 'Error',
          description: 'Session expired. Please login again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || 'Server error occurred';
        console.error('Server error details:', errorMessage);
        toast({
          title: 'Error',
          description: `Server error: ${errorMessage}. Please check the console for details.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to update profile: ${error.response?.data?.message || error.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value });
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container maxW="100%" py={8}>
      <VStack spacing={8} align="stretch" w="100%">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Profile</Heading>
          <Button colorScheme="red" onClick={onLogout}>
            Logout
          </Button>
        </Flex>

        <Box p={6} borderRadius="lg" boxShadow="md" bg="white">
          <VStack spacing={6}>
            <Avatar size="xl" name={profile.username} />
            
            {isEditing ? (
              <VStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    type="email"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Age</FormLabel>
                  <Input
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    type="number"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <Input
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Medical History</FormLabel>
                  <Input
                    name="medicalHistory"
                    value={profile.medicalHistory}
                    onChange={handleChange}
                  />
                </FormControl>
                <Button colorScheme="blue" onClick={handleUpdate}>
                  Save Changes
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch" w="100%">
                <Box>
                  <Text fontWeight="bold">Username</Text>
                  <Text>{profile.username}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Email</Text>
                  <Text>{profile.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Age</Text>
                  <Text>{profile.age}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Gender</Text>
                  <Text>{profile.gender}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Medical History</Text>
                  <Text>{profile.medicalHistory}</Text>
                </Box>
                <Button colorScheme="blue" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </VStack>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile;