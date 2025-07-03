import axios from 'axios';

const api = axios.create({
    baseURL: 'https://task-manager-api.onrender.com/api',  // Update to your deployed server URL with /api prefix
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;