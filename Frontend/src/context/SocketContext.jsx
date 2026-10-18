import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("ownertoken") || localStorage.getItem("usertoken");

    // No token, no socket — the server requires authentication to connect.
    if (!token) {
      setSocket(null);
      return;
    }

    const newSocket = io(`${SOCKET_URL}`, {
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
      // The server joins this socket to its own room after verifying the token.
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
