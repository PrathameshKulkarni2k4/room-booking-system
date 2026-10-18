import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext();

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect when someone is signed in — the server requires a token,
    // and the socket is (re)created whenever the auth state changes.
    if (!isAuthenticated) {
      setSocket(null);
      return;
    }

    const token = localStorage.getItem(
      role === "owner" ? "ownertoken" : "usertoken"
    );
    if (!token) {
      setSocket(null);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 10000,
      withCredentials: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, role]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
