import axios from 'axios';

const api = axios.create({
    baseURL: 'https://task-manager-api.onrender.com',  // Update to your deployed server URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;