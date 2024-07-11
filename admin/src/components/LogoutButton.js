import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Token before removal:', localStorage.getItem('token')); // Log token before removal
    localStorage.removeItem('token'); // Clear the token from localStorage
    console.log('Token after removal:', localStorage.getItem('token')); // Log token after removal
    navigate('/login'); // Redirect to login page
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
