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

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://marn-stack-task-manager.onrender.com',
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

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            return Promise.reject(error);
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
        const response = await API.post('/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error('Create task error:', error);
        throw error;
    }
};

export const updateTask = async (taskId, taskData) => {
    try {
        console.log('Updating task:', taskId);
        const response = await API.put(`/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        console.error('Update task error:', error);
        throw error;
    }
};

export const deleteTask = async (taskId) => {
    try {
        console.log('Deleting task:', taskId);
        const response = await API.delete(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error('Delete task error:', error);
        throw error;
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
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 200) {
            // Ensure we get the correct response format
            const { status, message, token, user, data } = response.data;
            
            if (status && status === true && token && user) {
                localStorage.setItem('token', token);
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
        let errorMessage = error.response?.data?.message;
        if (!errorMessage) {
            errorMessage = error.message || 'Login failed. Please try again.';
        }
        throw new Error(errorMessage);
    }
};

export const logout = async () => {
    try {
        localStorage.removeItem('token');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
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

export const updateUser = async (userId, userData) => {
    try {
        console.log('Updating user:', userId);
        const response = await API.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};
