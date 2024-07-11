import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = jwtDecode(token).role;
      if (userRole === 'admin') {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      
      // Ensure the response contains the token
      console.log('Login response:', response);

      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        const userRole = jwtDecode(token).role;

        if (userRole === 'admin') {
          navigate('/dashboard');
        } else {
          setError('Access Denied: Admins only');
        }
      } else {
        setError('Login error: No token received');
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        // Check if the error status is 403 (Forbidden)
        if (error.response.status === 403) {
          setError('Login error: User not active');
        } else {
          setError(`Login error: ${error.response.data.message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError('Login error: No response received');
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error setting up request:', error.message);
        setError(`Login error: ${error.message}`);
      }
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 block w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? 'Logging in...' : 'Login'} {/* Change button text based on loading state */}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
        </form>
      </div>
    </div>
  );
}

export default Login;
