import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("usertoken");
  return isAuthenticated ? children : <Navigate to="/user-login" />;
};

export default PrivateRoute;
