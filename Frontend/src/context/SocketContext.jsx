import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const BASE = import.meta.env.VITE_API_BASE_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${BASE}`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 10000,
      withCredentials: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    console.log(BASE);

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);

      // Check localStorage for owner or user
      const ownerData = localStorage.getItem("owner");
      const userData = localStorage.getItem("user");

      if (ownerData) {
        const owner = JSON.parse(ownerData);
        if (owner && owner._id) {
          newSocket.emit("join-user-room", `Owner-${owner._id}`);
          console.log("🟦 Joined socket room ", `Owner-${owner._id}`);
        }
      } else if (userData) {
        const user = JSON.parse(userData);
        if (user && user._id) {
          newSocket.emit("join-user-room", `User-${user._id}`);
          console.log("🟩 Joined socket room ", `User-${user._id}`);
        }
      } else {
        console.warn("⚠️ No valid user or owner found in localStorage.");
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('🚨 Connection error:', err.message);
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
