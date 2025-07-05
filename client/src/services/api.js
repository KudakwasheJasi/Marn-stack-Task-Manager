/**
 * @description      : 
 * @author           : kudakwashe Ellijah
 * @group            : 
 * @created          : 03/07/2025 - 17:57:45
 * 
 * MODIFICATION LOG
 * - Version         : 1.0.1
 * - Date            : 04/07/2025
 * - Author          : kudakwashe Ellijah
 * - Modification    : Fixed double /api prefix in health check URL
 * - Version         : 1.0.2
 * - Date            : 04/07/2025
 * - Author          : kudakwashe Ellijah
 * - Modification    : Updated API configuration to use the correct URL with /api prefix
**/
import axios from 'axios';
import { useAudio } from './audioService';

const audio = useAudio();

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://marn-stack-task-manager.onrender.com/api',
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor with token handling and logging
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const sanitizedConfig = {
            url: config.url,
            method: config.method,
            headers: { ...config.headers }
        };
        if (sanitizedConfig.headers.Authorization) {
            sanitizedConfig.headers.Authorization = 'Bearer [REDACTED]';
        }
        console.log('API Request:', sanitizedConfig);
        return config;
    },
    (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
API.interceptors.response.use(
    (response) => {
        const sanitizedResponse = {
            url: response.config.url,
            status: response.status,
            data: response.config.url.includes('auth') ? '[REDACTED]' : response.data
        };
        console.log('API Response:', sanitizedResponse);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        originalRequest._retry = originalRequest._retry || 0;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.log('Authentication failed, clearing user session');
            
            // Clear all authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Reset API headers
            API.defaults.headers.common = {};
            API.defaults.headers.Authorization = '';
            
            // Redirect to login page if we're not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
            
            return Promise.reject(new Error('Authentication failed. Please login again.'));
        }

        if (error.code === 'ERR_NETWORK' && originalRequest._retry < 3) {
            originalRequest._retry += 1;
            console.log(`Retrying request (${originalRequest._retry}/3)...`);

            const delay = Math.min(1000 * (2 ** originalRequest._retry), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));

            try {
                const isHealthy = await checkServerHealth();
                if (isHealthy) {
                    return API(originalRequest);
                }
                throw new Error('Server is not responding');
            } catch (healthError) {
                throw new Error('Unable to connect to server');
            }
        }

        return Promise.reject(error);
    }
);

// Error handler
const handleApiError = (context, error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;
    const retryCount = error.config?._retry || 0;

    console.error('API Error Details:', {
        context,
        statusCode,
        message: errorMessage,
        retryCount,
        errorCode: error.code,
        timestamp: new Date().toISOString()
    });

    throw new Error(errorMessage || `${context} operation failed`);
};

// Server health check function
export const checkServerHealth = async () => {
    try {
        const response = await API.get('/health');
        return response.data.status === 'ok';
    } catch (error) {
        console.error('Health check error:', error);
        return false;
    }
};

// User registration function
export const register = async (userData) => {
    try {
        console.log('Registering user:', userData);
        const response = await API.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
    }
};

// Task-related functions
export const getTasks = async () => {
    try {
        const response = await API.get('/tasks');
        return response.data;
    } catch (error) {
        console.error('Get tasks error:', error);
        throw error;
    }
};

export const createTask = async (taskData) => {
    try {
        console.log('Creating task:', taskData);
        const response = await API.post('/tasks/create', taskData);
        audio.playSuccess();
        return response.data;
    } catch (error) {
        console.error('Create task error:', error);
        audio.playError();
        throw new Error('Failed to create task. Please try again.');
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        console.log('Updating task:', taskId);
        const response = await API.put(`/tasks/${taskId}`, taskData);
        audio.playSuccess();
        return response.data;
    } catch (error) {
        console.error('Update task error:', error);
        audio.playError();
        throw new Error('Failed to update task. Please try again.');
    }
};

export const deleteTask = async (taskId) => {
    try {
        console.log('Deleting task:', taskId);
        const response = await API.delete(`/tasks/${taskId}`);
        audio.playSuccess();
        return response.data;
    } catch (error) {
        console.error('Delete task error:', error);
        audio.playError();
        throw new Error('Failed to delete task. Please try again.');
    }
};

export const getTaskById = async (taskId) => {
    try {
        console.log('Fetching task:', taskId);
        const response = await API.get(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error('Get task error:', error);
        throw error;
    }
};

// User-related functions
export const login = async (credentials) => {
    try {
        console.log('Attempting login...', credentials);
        const response = await API.post('/auth/login', credentials, {
            timeout: 30000, // Increased to 30 seconds
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: (status) => {
                // Consider any status between 200-299 as success
                return status >= 200 && status < 300;
            }
        });
        
        if (response.status === 200) {
            // Ensure we get the correct response format
            const { status, message, token, user, data } = response.data;
            
            if (status && status === true && token && user) {
                localStorage.setItem('token', token);
                audio.playSuccess();
                return { token, user };
            } else if (data) {
                throw new Error(data.message || 'Invalid login response format');
            } else {
                throw new Error(message || 'Invalid login response format');
            }
        } else {
            // Handle error cases
            const { status, message, data } = response.data || {};
            if (data?.message) {
                throw new Error(data.message);
            } else if (message) {
                throw new Error(message);
            } else {
                throw new Error('Login failed. Please check your credentials and try again.');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        audio.playError();
        let errorMessage = error.response?.data?.message;
        
        if (!errorMessage) {
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Connection timeout. Please check your internet connection and try again.';
            } else if (error.code === 'ERR_BAD_REQUEST') {
                errorMessage = 'Invalid request. Please check your credentials and try again.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else {
                errorMessage = error.message || 'Login failed. Please try again.';
            }
        }
        throw new Error(errorMessage);
    }
};

export const logout = async () => {
    try {
        // Clear token from localStorage first
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Cancel any pending requests
        if (API.defaults.cancelToken) {
            API.defaults.cancelToken.cancel('Logout requested');
        }
        
        // Reset API instance headers
        API.defaults.headers.common = {};
        API.defaults.headers.Authorization = '';
        
        // Try to call logout endpoint (but don't fail if it doesn't work)
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.log('Logout API call failed, but continuing with local cleanup');
        }
        
        audio.playNotification();
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        audio.playError();
        throw new Error('Failed to logout. Please try again.');
    }
};

export const addUser = async (userData) => {
    try {
        console.log('Adding user:', userData);
        const response = await API.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error('Add user error:', error);
        throw error;
    }
};

export const uploadProfileImage = async (formData) => {
    try {
        const response = await API.post('/users/upload-profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        handleApiError('uploadProfileImage', error);
        throw error;
    }
};

export const updatePassword = async (passwordData) => {
    try {
        const response = await API.put('/users/change-password', passwordData);
        return response.data;
    } catch (error) {
        handleApiError('updatePassword', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await API.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        handleApiError('updateUser', error);
        throw error;
    }
};

// Notification-related functions
export const getNotifications = async () => {
    try {
        const response = await API.get('/users/notifications');
        return response.data;
    } catch (error) {
        handleApiError('getNotifications', error);
        throw error;
    }
};

export const markNotificationRead = async (type, id) => {
    try {
        const params = type === 'all' ? { isReadType: 'all' } : { isReadType: 'single', id };
        const response = await API.put('/users/read-noti', null, { params });
        return response.data;
    } catch (error) {
        handleApiError('markNotificationRead', error);
        throw error;
    }
};

// Test function to create a test notification
export const createTestNotification = async () => {
    try {
        const response = await API.post('/users/test-notification');
        return response.data;
    } catch (error) {
        handleApiError('createTestNotification', error);
        throw error;
    }
};

// Test function to clear test notifications
export const clearTestNotifications = async () => {
    try {
        const response = await API.delete('/users/clear-test-notifications');
        return response.data;
    } catch (error) {
        handleApiError('clearTestNotifications', error);
        throw error;
    }
};
