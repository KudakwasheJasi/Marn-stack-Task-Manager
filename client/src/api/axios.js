import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8800',  // Make sure this matches your server PORT
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;