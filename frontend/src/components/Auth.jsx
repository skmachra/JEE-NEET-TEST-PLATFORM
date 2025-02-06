import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/api/v1/users/current-user", {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Auth check error:", error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    
    const checkAuth = async () => {
      try {
        const loggedInUser = await checkLoginStatus();
        
        if (isMounted) {
          setUser(loggedInUser);
          setIsLoggedIn(!!loggedInUser);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []);

  // Wait until loading is complete before rendering children
  if (loading) {
    return <div>Loading authentication state...</div>;
  }  

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, setUser, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);