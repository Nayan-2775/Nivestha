import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

localStorage.removeItem("token");
localStorage.removeItem("user");

const storedToken = sessionStorage.getItem("token");
const storedUser = sessionStorage.getItem("user");

const [token,setToken] = useState(storedToken);
const [user,setUser] = useState(
storedUser ? JSON.parse(storedUser) : null
);

const login = (token,userData) => {

sessionStorage.setItem("token",token);
sessionStorage.setItem("user",JSON.stringify(userData));

setToken(token);
setUser(userData);

};

const logout = () => {

sessionStorage.removeItem("token");
sessionStorage.removeItem("user");
localStorage.removeItem("token");
localStorage.removeItem("user");

setToken(null);
setUser(null);

};

return(

<AuthContext.Provider value={{
token,
user,
login,
logout
}}>

{children}

</AuthContext.Provider>

);

};

export const useAuth = () => useContext(AuthContext);
