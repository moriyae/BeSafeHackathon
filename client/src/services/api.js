import axios from 'axios';
const apiUrl = import.meta.env.VITE_SERVER_API_URL;

// Create an instance of Axios with default configurations
console.log("My API URL is:", import.meta.env.VITE_SERVER_API_URL);
const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
