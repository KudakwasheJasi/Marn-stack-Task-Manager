import axios from 'axios';

const BASE_URL = 'http://localhost:8800/api';

const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Server health check function
const checkServerHealth = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }

        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error('Health check error:', error);
        return false;
    }
};

// Task-related functions
const getTasks = async () => {
    try {
        console.log('Fetching tasks...');
        const response = await API.get('/tasks');
        console.log('Tasks fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Get tasks', error);
    }
};

const createTask = async (taskData) => {
    try {
        console.log('Creating task:', taskData);
        const response = await API.post('/tasks/create', taskData);
        console.log('Task created successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Create task', error);
    }
};

const updateTask = async (taskId, taskData) => {
    try {
        console.log('Updating task:', taskId, taskData);
        const response = await API.put(`/tasks/${taskId}`, taskData);
        console.log('Task updated successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Update task', error);
    }
};

// Modified deleteTask function
const deleteTask = async (taskId) => {
    try {
        console.log('Deleting task:', taskId);
        const response = await API.delete(`/tasks/${taskId}`); // Ensure this URL is correct
        console.log('Task deleted successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Delete task', error);
    }
};

const getTaskById = async (taskId) => {
    try {
        console.log('Fetching task:', taskId);
        const response = await API.get(`/tasks/${taskId}`);
        console.log('Task fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Get task', error);
    }
};

// User-related functions
const register = async (userData) => {
    try {
        console.log('Registering user...', userData);
        const response = await API.post('/auth/register', userData);
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        
        return response.data;
    } catch (error) {
        handleApiError('Registration', error);
    }
};

const login = async (credentials) => {
    try {
        console.log('Attempting login...');
        const response = await API.post('/auth/login', credentials);
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('Login successful');
        }
        
        return response.data;
    } catch (error) {
        handleApiError('Login', error);
    }
};

const logout = async () => {
    try {
        console.log('Logging out...');
        await API.post('/auth/logout');
        localStorage.removeItem('token');
        console.log('Logout successful');
    } catch (error) {
        localStorage.removeItem('token');
        handleApiError('Logout', error);
    }
};

// New user management functions
const addUser = async (userData) => {
    try {
        console.log('Adding user...', userData);
        const response = await API.post('/users', userData); // Adjust the endpoint as necessary
        console.log('User added successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Add user', error);
    }
};

const updateUser = async (userId, userData) => {
    try {
        console.log('Updating user:', userId, userData);
        const response = await API.put(`/users/${userId}`, userData); // Adjust the endpoint as necessary
        console.log('User updated successfully:', response.data);
        return response.data;
    } catch (error) {
        handleApiError('Update user', error);
    }
};

// Request interceptor
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

// Response interceptor
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
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please login again.'));
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

// Export all methods
export {
    register,
    login,
    logout,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    checkServerHealth,
    addUser,
    updateUser
};

export default API;