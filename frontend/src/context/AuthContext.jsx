import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_URL, AUTH_ENDPOINTS } from '../config';

// Create the context with a default value
const AuthContext = createContext({
    token: null,
    user: null,
    login: async () => {},
    register: async () => {},
    logout: () => {}
});

// Create a named export for the hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Create a named export for the provider
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    // Configure axios defaults
    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 5000; // 5 second timeout

    // Add request interceptor for logging
    axios.interceptors.request.use(
        (config) => {
            console.log('Making request to:', config.url);
            console.log('Request config:', {
                method: config.method,
                headers: config.headers,
                data: config.data
            });
            return config;
        },
        (error) => {
            console.error('Request error:', error);
            return Promise.reject(error);
        }
    );

    // Add response interceptor for logging
    axios.interceptors.response.use(
        (response) => {
            console.log('Response received:', {
                status: response.status,
                data: response.data
            });
            return response;
        },
        (error) => {
            console.error('Response error:', {
                message: error.message,
                response: error.response,
                request: error.request
            });
            return Promise.reject(error);
        }
    );

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', { email });
            console.log('API URL:', API_URL);
            console.log('Login endpoint:', AUTH_ENDPOINTS.LOGIN);
            
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Password length validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
                email: email.trim().toLowerCase(),
                password: password.trim()
            });

            console.log('Login response:', response.data);

            if (!response.data || !response.data.token) {
                throw new Error('Invalid response from server');
            }

            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            
            // Set the token in axios headers for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return { token, user };
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Login failed');
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('No response from server. Please check your connection.');
            } else {
                console.error('Error setting up request:', error.message);
                throw new Error(error.message || 'An error occurred during login');
            }
        }
    };

    const register = async (email, password) => {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Password length validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
                email: email.trim().toLowerCase(),
                password: password.trim()
            });

            if (!response.data || !response.data.token) {
                throw new Error('Invalid response from server');
            }

            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            
            // Set the token in axios headers for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return { token, user };
        } catch (error) {
            console.error('Register error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(error.response.data.message || 'Registration failed');
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('No response from server. Please check your connection.');
            } else {
                console.error('Error setting up request:', error.message);
                throw new Error(error.message || 'An error occurred during registration');
            }
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        token,
        user,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 