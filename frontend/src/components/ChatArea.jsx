import { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";
import { SocketProvider } from "../socket/SocketContext";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  useEffect(() => {
    const getMess = async () => {
      if (selectedConversation) {
        if (selectedConversation.title == "New Chat") return;
        const data = await getMessages(selectedConversation?._id);
        
        dispatch(setMessages(data));
        const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
      }
    };
    getMess();
  }, [selectedConversation?._id]);

  return (
    <SocketProvider>
    <div className="flex-1 flex flex-col min-w-0">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
    </SocketProvider>
  );
}

export default ChatArea;
