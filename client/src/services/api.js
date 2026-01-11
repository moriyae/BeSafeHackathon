import axios from 'axios';

// הגדרת החיבור לשרת (מוודאים שזה פורט 5000)
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;