import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const { t  } = useTranslation();
  // const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  // const isUsersView = location.pathname.includes("/users");

  return (
    <MyContext.Provider value={{ searchQuery, setSearchQuery  , t  }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);