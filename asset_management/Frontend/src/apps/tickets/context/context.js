import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { name, role, authenticated }

  const login = (userData) => {
    setUser(userData); // Set user data after login
  };

  const logout = () => {
    setUser(null); // Clear user data after logout
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user context
export const useUser = () => useContext(UserContext);
