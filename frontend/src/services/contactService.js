import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Submit contact form
export const submitContact = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/contact/submit`, formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to submit contact form');
    }
};

// Get all contacts (admin only)
export const getContacts = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/contact/all`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
    }
};

// Update contact status (admin only)
export const updateStatus = async (id, status, token) => {
    try {
        const response = await axios.patch(
            `${API_URL}/contact/${id}/status`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update status');
    }
};

// Delete contact (admin only)
export const deleteContact = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/contact/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete contact');
    }
}; 