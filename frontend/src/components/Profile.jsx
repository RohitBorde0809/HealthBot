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

      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProfile({
        username: response.data.user.username || '',
        email: response.data.user.email || '',
        age: response.data.user.age || '',
        gender: response.data.user.gender || '',
        medicalHistory: response.data.user.medicalHistory || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid email address',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate age if provided
      if (profile.age && (isNaN(profile.age) || profile.age < 0 || profile.age > 120)) {
        toast({
          title: 'Error',
          description: 'Age must be a number between 0 and 120',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate gender if provided
      if (profile.gender && !['male', 'female', 'other', ''].includes(profile.gender.toLowerCase())) {
        toast({
          title: 'Error',
          description: 'Gender must be one of: male, female, other',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const updateData = {
        user: {
          username: profile.username.trim(),
          email: profile.email.trim(),
          ...(profile.age !== undefined && { age: profile.age === '' ? null : parseInt(profile.age) }),
          ...(profile.gender !== undefined && { gender: profile.gender === '' ? '' : profile.gender.toLowerCase().trim() }),
          ...(profile.medicalHistory !== undefined && { medicalHistory: profile.medicalHistory.trim() })
        }
      };

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
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
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
                <Button onClick={() => setIsEditing(false)}>
                  Cancel
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