"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasSetUsername = username.length > 0;

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/chat");
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        // Update last message time if there are messages
        const latestMessageTime =
          data.messages[data.messages.length - 1].created_at;
        if (latestMessageTime !== lastMessageTime) {
          setLastMessageTime(latestMessageTime);
          // Scroll to bottom after new messages
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [lastMessageTime]);

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Set up polling every 3 seconds, but only fetch if there might be new messages
    const interval = setInterval(async () => {
      const response = await fetch("/api/chat");
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        const latestMessageTime =
          data.messages[data.messages.length - 1].created_at;
        if (latestMessageTime !== lastMessageTime) {
          fetchMessages();
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastMessageTime, fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsLoading(false);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  if (!hasSetUsername) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 w-full max-w-sm">
        <h3 className="text-lg font-medium mb-4">
          Enter your username to chat
        </h3>
        <form onSubmit={handleUsernameSubmit}>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!tempUsername.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 w-full max-w-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Chat</h3>
        <button
          onClick={() => {
            setUsername("");
            setTempUsername("");
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Change Username
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.username === username
                ? "bg-purple-600/20 ml-8"
                : "bg-gray-700/50 mr-8"
            } p-3 rounded-lg`}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-medium text-sm text-purple-400">
                {msg.username}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm break-words">{msg.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={isLoading || !newMessage.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
          aria-label="Send message"
        >
          <SendHorizontal size={20} />
        </button>
      </form>
    </div>
  );
}
