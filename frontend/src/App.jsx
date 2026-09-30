import { useEffect } from "react";
import Home from "./pages/Home";
import getCurrentUser from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";
import { socket } from "./socket";
import { SocketProvider } from "./socket/SocketContext";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      
      const data = await getCurrentUser();
      dispatch(setUserData(data));
    };

    getUser();
  }, []);

  // useEffect(() => {
  //    socket.on("connect", () => {
  //     console.log("socket connected", socket.id)
  //    })
  //    socket.on("agentMismatch",(data) => {
  //     console.log("agent_mismatch", data)
  //    })
  //    return () => {
  //     socket.off("connect")
  //    }
  // }, [])

  return (
    <>
    
      <Home />
    
    </>
  );
}

export default App;
