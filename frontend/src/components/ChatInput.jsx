import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import sendMessage from "../features/sendMessage";
import { useDispatch, useSelector } from "react-redux";
import { addMessages, setArtifacts, setIsloading } from "../redux/messageSlice";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  setConversationTitle,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { updateConversation } from "../features/updateConversation";
import { useSocket } from "../socket/SocketContext";


function ChatInput() {
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const [valuee, setValuee] = useState("");
  const { selectedConversation } = useSelector((state) => state.conversation);
  const [selectedFile, setSelectedFile] = useState(null);
  const {isLoading} = useSelector(state => state.message)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { info } = useSocket();
  const [error, setError] = useState(false)

   // 1. Log the mismatch info and dynamically switch the active agent tab
  // Find this inside your ChatInput component and update it:
  // 1. Log the mismatch info and dynamically switch the active agent tab cleanly
    // 1. Log the mismatch info, turn off loading status, and switch the active agent tab
  useEffect(() => {
    console.log("📝 ChatInput re-rendered! Current info state:", info);
    
    if (info && info.requiredAgent) {
      console.log("🎯 Match found! New Agent Data:", info);
      
      // 🟢 FIX: Turn off the loading state since the request needs to be re-sent or updated
      dispatch(setIsloading(false));
      setError(true)

      // Look up the exact matching case-sensitive item in your agents array
      const targetAgent = agents.find(
        (a) => a.id === info.requiredAgent.toLowerCase() || a.label.toLowerCase() === info.requiredAgent.toLowerCase()
      );

      if (targetAgent) {
        setSelectedAgent(targetAgent.label);
      } else {
        const fallbackLabel = info.requiredAgent.charAt(0).toUpperCase() + info.requiredAgent.slice(1);
        setSelectedAgent(fallbackLabel);
      }
    }
  }, [info, dispatch]); // Added dispatch to dependency array for best practice React architecture

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onerror = (event) => {
  console.log("SpeechRecognition error:", event.error)
}

    recognition.onresult = (event) => {
      let transcript = ""

      for (let index = event.resultIndex; index < event.results.length; index++){
          
        transcript += event.results[index][0].transcript
      }
      console.log("transcipt",transcript)
      setValuee(transcript)
    };

    recognition.onend=()=>{
      setListening(false)
    }

    recognitionRef.current = recognition
}, []);


const togglemic = () => {
  console.log("toggle clicked", listening)
  if(!recognitionRef.current){
    alert("speech recognition not supported")
    return
}
  if(listening){
    recognitionRef.current.stop()
    setListening(false)
  }else{
    recognitionRef.current.start()
    setListening(true)
  }
}

  const handleSendMessage = async () => {
    setError(false)
    console.log("entered")
    dispatch(setIsloading(true))
    const message = valuee.trim();

    if (!message) return;

    setValuee(""); // Clear immediately

    let conversation = selectedConversation;

    if (!selectedConversation) {
      const conv = await createConversation();
      dispatch(setSelectedConversation(conv));
      dispatch(addConversation(conv));
      conversation = conv;
    }

    if (conversation.title === "New Chat") {
      await updateConversation({
        id: conversation._id,
        title: message,
      });

      dispatch(
        setConversationTitle({
          conversationId: conversation._id,
          title: message.slice(0, 40),
        }),
      );
    }

    dispatch(addMessages({ role: "user", content: message }));

    console.log(selectedFile);
    const formData = new FormData();

    formData.append("prompt", message);
    formData.append("conversationId", conversation?._id);
    formData.append("agent", selectedAgent.toLowerCase());
    if(selectedFile){
          formData.append("file", selectedFile)
    }

    try {
      const data = await sendMessage(formData);
      dispatch(setIsloading(false))
      dispatch(setArtifacts(data?.artifacts || []));

      dispatch(
        addMessages({
          role: "assistant",
          content: data?.answer,
          images: data?.images,
        }),
      );
      
    } catch (error) {
      console.error(error);
      dispatch(setIsloading(false))
    }
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "vision",
      icon: ImageIcon,
      label: "Vision",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];
  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/3 border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
        <div className="flex w-[80%]  gap-2 pr-2 flex-wrap">
          <div className="flex w-full text-sm mt-1">
  {error && (
    <span className="text-red-500 font-medium">
      Appropriate agent has been selected
    </span>
  )}
</div>

          {agents.map((agent, i) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;
            return (
              <div
                key={i}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
                cursor-pointer
                shrink-0
                inline-flex
                items-center
                gap-1.5
                px-3
                py-2
                rounded-full
                text-xs
                font-medium
                border
                transition-all
                ${
                  isActive
                    ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                    : "bg-white/3 text-slate-400 border-white/6 hover:bg-white/[0.07]"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />

                {agent.label}
              </div>
            );
          })}
        </div>

        {selectedFile && (
          <div className="my-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white[0.04] px-3 py-2">
              {selectedFile?.type === "application/pdf" ? (
                <FileText size={16} className="text-red-400" />
              ) : (
                selectedFile.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    className="h-10 w-10 rounded-xl object-cover mt-3"
                  />
                )
              )}

              <div>
              <p className="text-xs text-white">{selectedFile?.name}</p>
              <p className="text-[10px] text-slate-500">
                {Math.ceil(selectedFile.size)}KB
              </p>
            </div>
            <button
              className="ml-2"
              onClick={() => {
                setSelectedFile(null);
                fileRef.current.value = "";
              }}
            >
              <X size={14} className="text-slate-500 hover:text-white" />
            </button>
            </div>

            
          </div>
        )}

        <textarea
          placeholder="Ask Anything..."
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          disabled={false}
          rows={3}
          value={valuee}
          onChange={(e) => setValuee(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf,image/*"
              hidden
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600
    hover:text-slate-400 hover:bg-white/5
    border border-transparent hover:border-white/6
    transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={16} />
            </button>

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600
    hover:text-slate-400 hover:bg-white/5
    border border-transparent hover:border-white/6
    transition-all duration-150 bg-transparent cursor-pointer"
            onClick={togglemic}
            >
              {listening ?<Mic size={16} /> : <MicOff size={16}/> }
            </button>
          </div>
          <button
            disabled={!valuee.trim() || isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150 ${
              valuee.trim()
                ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            {/* Icon */}
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
