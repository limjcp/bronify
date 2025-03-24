"use client";
import { MessageCircle } from "lucide-react";
import ChatBox from "./ChatBox";

export default function MobileChatToggle() {
  const handleToggleChat = () => {
    const chatSidebar = document.getElementById("mobile-chat");
    if (chatSidebar) {
      chatSidebar.classList.toggle("translate-y-full");
    }
  };

  return (
    <>
      {/* Mobile chat toggle */}
      <div className="lg:hidden fixed bottom-24 right-4 z-50">
        <button
          onClick={handleToggleChat}
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full shadow-lg"
          title="Toggle chat"
          aria-label="Toggle chat window"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile chat sidebar */}
      <div
        id="mobile-chat"
        className="lg:hidden fixed bottom-0 left-0 right-0 h-96 bg-gray-900 transform translate-y-full transition-transform duration-300 ease-in-out z-40"
      >
        <div className="p-4 h-full">
          <ChatBox />
        </div>
      </div>
    </>
  );
}
