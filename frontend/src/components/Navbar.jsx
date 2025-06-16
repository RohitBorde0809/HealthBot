import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChatIcon,
  TimeIcon,
} from '@chakra-ui/icons';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const isLoggedIn = localStorage.getItem('token') !== null;
  const username = localStorage.getItem('username');

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
            fontWeight="bold"
            fontSize="xl"
          >
            <RouterLink to="/">AI Chat</RouterLink>
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <Stack direction={'row'} spacing={4}>
              {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                  <Popover trigger={'hover'} placement={'bottom-start'}>
                    <PopoverTrigger>
                      <Link
                        as={RouterLink}
                        p={2}
                        to={navItem.to ?? '#'}
                        fontSize={'sm'}
                        fontWeight={500}
                        color={useColorModeValue('gray.600', 'gray.200')}
                        _hover={{
                          textDecoration: 'none',
                          color: useColorModeValue('gray.800', 'white'),
                        }}>
                        {navItem.label}
                      </Link>
                    </PopoverTrigger>

                    {navItem.children && (
                      <PopoverContent
                        border={0}
                        boxShadow={'xl'}
                        bg={useColorModeValue('white', 'gray.800')}
                        p={4}
                        rounded={'xl'}
                        minW={'sm'}>
                        <Stack>
                          {navItem.children.map((child) => (
                            <DesktopSubNav key={child.label} {...child} />
                          ))}
                        </Stack>
                      </PopoverContent>
                    )}
                  </Popover>
                </Box>
              ))}
            </Stack>
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}>
          {isLoggedIn ? (
            <>
              <Button
                as={RouterLink}
                to="/chat"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'blue.400'}
                href={'#'}
                _hover={{
                  bg: 'blue.300',
                }}
                leftIcon={<ChatIcon />}
              >
                Chat
              </Button>
              <Button
                as={RouterLink}
                to="/history"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'green.400'}
                href={'#'}
                _hover={{
                  bg: 'green.300',
                }}
                leftIcon={<TimeIcon />}
              >
                History
              </Button>
              <Button
                as={RouterLink}
                to="/api-test"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'purple.400'}
                href={'#'}
                _hover={{
                  bg: 'purple.300',
                }}
              >
                API Test
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    name={username}
                    bg={'blue.400'}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    window.location.href = '/signin';
                  }}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                color={useColorModeValue('gray.600', 'gray.200')}
                _hover={{
                  color: useColorModeValue('gray.800', 'white'),
                }}
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'blue.400'}
                href={'#'}
                _hover={{
                  bg: 'blue.300',
                }}>
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopSubNav = ({ label, to, subLabel }) => {
  return (
    <Link
      to={to}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'blue.400' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'blue.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, to }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        to={to ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} to={child.to}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Features',
    children: [
      {
        label: 'AI Chat',
        subLabel: 'Chat with our advanced AI',
        to: '/chat',
      },
      {
        label: 'Chat History',
        subLabel: 'View your past conversations',
        to: '/history',
      },
    ],
  },
  {
    label: 'About',
    to: '/about',
  },
  {
    label: 'Contact',
    to: '/contact',
  },
];