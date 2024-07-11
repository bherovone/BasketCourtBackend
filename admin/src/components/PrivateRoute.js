import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userRole = token ? jwtDecode(token).role : null;

  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
