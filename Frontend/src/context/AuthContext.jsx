import { createContext, useContext, useMemo, useState, useCallback } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

const readStored = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const initialRole = () => {
  if (localStorage.getItem("ownertoken")) return "owner";
  if (localStorage.getItem("usertoken")) return "user";
  return null;
};

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(initialRole);
  const [account, setAccount] = useState(
    () => readStored("owner") || readStored("user")
  );

  const loginUser = useCallback(async (credentials) => {
    const { data } = await api.post("/api/v1/users/login", credentials);
    const { accessToken, refreshToken, user } = data.data;
    localStorage.setItem("usertoken", accessToken);
    if (refreshToken) localStorage.setItem("userrefresh", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.removeItem("ownertoken");
    localStorage.removeItem("ownerrefresh");
    localStorage.removeItem("owner");
    setRole("user");
    setAccount(user);
    return data;
  }, []);

  const loginOwner = useCallback(async (credentials) => {
    const { data } = await api.post("/api/v1/owner/login", credentials);
    const { accessToken, refreshToken, user } = data.data;
    localStorage.setItem("ownertoken", accessToken);
    if (refreshToken) localStorage.setItem("ownerrefresh", refreshToken);
    localStorage.setItem("owner", JSON.stringify(user));
    localStorage.removeItem("usertoken");
    localStorage.removeItem("userrefresh");
    localStorage.removeItem("user");
    setRole("owner");
    setAccount(user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const path =
      role === "owner" ? "/api/v1/owner/logout" : "/api/v1/users/logout";
    try {
      await api.post(path);
    } catch {
      // Ignore — we clear the client session regardless.
    }
    localStorage.clear();
    setRole(null);
    setAccount(null);
  }, [role]);

  const value = useMemo(
    () => ({
      role,
      account,
      isAuthenticated: !!role,
      loginUser,
      loginOwner,
      logout,
    }),
    [role, account, loginUser, loginOwner, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
