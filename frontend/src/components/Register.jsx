import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Basic validation
            if (!email || !password || !confirmPassword) {
                throw new Error('Please fill in all fields');
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

            // Password match validation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            const response = await register(email, password);
            console.log('Registration successful:', response);
            navigate('/chat');
        } catch (err) {
            console.error('Registration error details:', err);
            setError(err.response?.data?.message || err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register; 