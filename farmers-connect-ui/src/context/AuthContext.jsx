import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const extractUserFromToken = (decoded) => {
    return {
      name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    };
  };

  useEffect(() => {
    const initializeAuth = () => {
      console.log('Initializing auth...');
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);

      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log('Decoded token on app load:', decoded);
          const userData = extractUserFromToken(decoded);
          setUser(userData);
          console.log('User state set from token:', userData);
        } catch (error) {
          console.error('Error decoding token on app load:', error);
          localStorage.removeItem('token');
        }
      } else {
        console.log('No token found in localStorage');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token) => {
    console.log('Login function called with token:', token);
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      console.log('Decoded token during login:', decoded);
      
      const userData = extractUserFromToken(decoded);
      setUser(userData);
      console.log('User state updated during login:', userData);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout function called');
    localStorage.removeItem('token');
    setUser(null);
    console.log('User state cleared during logout');
  };

  console.log('Current user state:', user);
  console.log('Current loading state:', isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);