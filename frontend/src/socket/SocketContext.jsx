import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAgent, setCurrentAgent] = useState({ id: "default", name: "Standard Agent" });
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const socketInstance = io("http://localhost:8003", { autoConnect: true });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("socket connected", socketInstance.id);
      setIsConnected(true);
    });

    // Handle the agent mismatch and update context state
    // Inside SocketContext.jsx:
socketInstance.on("agentMismatch", (data) => {
  console.log("agent_mismatch received:", data);
  
  // Look for your backend's 'requiredAgent' property instead of 'newAgentId'
  if (data && data.requiredAgent) {
    setInfo(data);
    
    // Format the name nicely so it can map to your UI pill labels
    const formattedName = data.requiredAgent.charAt(0).toUpperCase() + data.requiredAgent.slice(1);

    setCurrentAgent({
      id: data.requiredAgent,       // e.g., "coding"
      name: formattedName           // e.g., "Coding"
    });
  }
});


    // Clean up event listeners and disconnect socket on component unmount
    return () => {
      socketInstance.off("connect");
      socketInstance.off("agentMismatch");
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider 
      value={{ 
        socket, 
        isConnected, 
        currentAgent, 
        setCurrentAgent, 
        info, 
        setInfo 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
