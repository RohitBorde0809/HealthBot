import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitContact, getContacts, updateStatus } from '../services/contactService';
import '../styles/Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const { token, user } = useAuth();

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await submitContact(formData);
            setSuccess('Message sent successfully! We will get back to you soon.');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setError(error.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch contacts for admin
    useEffect(() => {
        const fetchContacts = async () => {
            if (token) {
                try {
                    const data = await getContacts(token);
                    setContacts(data);
                } catch (error) {
                    console.error('Error fetching contacts:', error);
                }
            }
        };

        fetchContacts();
    }, [token]);

    // Handle status update
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateStatus(id, newStatus, token);
            setContacts(prev => prev.map(contact => 
                contact._id === id ? { ...contact, status: newStatus } : contact
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="contact-container">
            <div className="contact-content">
                <h2>Contact Us</h2>
                <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="Subject of your message"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder="Your message"
                            rows="5"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>

                {/* Admin View */}
                {user && (
                    <div className="admin-view">
                        <h3>Contact Submissions</h3>
                        <div className="contacts-list">
                            {contacts.map(contact => (
                                <div key={contact._id} className="contact-item">
                                    <div className="contact-header">
                                        <h4>{contact.subject}</h4>
                                        <span className={`status ${contact.status}`}>
                                            {contact.status}
                                        </span>
                                    </div>
                                    <p><strong>From:</strong> {contact.name} ({contact.email})</p>
                                    <p><strong>Message:</strong> {contact.message}</p>
                                    <p><strong>Date:</strong> {new Date(contact.createdAt).toLocaleString()}</p>
                                    <div className="status-actions">
                                        <select
                                            value={contact.status}
                                            onChange={(e) => handleStatusUpdate(contact._id, e.target.value)}
                                        >
                                            <option value="new">New</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contact; 