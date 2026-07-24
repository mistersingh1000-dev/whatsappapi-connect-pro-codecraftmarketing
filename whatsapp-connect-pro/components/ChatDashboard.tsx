"use client";
import { useEffect, useState } from "react";

type Conversation = {
  id: string;
  userId: string;
  phoneNumberId: string;
  contactPhone: string;
  contactName: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  createdAt: string;
};

type Message = {
  id: string;
  conversationId: string;
  sender: "user" | "contact";
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  waMessageId: string | null;
};

export default function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0) {
          setSelectedConvId(data.conversations[0].id);
        }
      } else {
        setError(data.error || "Failed to load conversations");
      }
    } catch (e) {
      setError("Error loading conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Error loading messages", e);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConvId) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvId, content: messageInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.message]);
        setMessageInput("");
      } else {
        setError(data.error || "Failed to send");
      }
    } catch (e) {
      setError("Error sending message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading chats...</div>;

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-line bg-black overflow-y-auto">
        <div className="p-4 border-b border-line">
          <h2 className="text-lg font-semibold">Chats</h2>
          <p className="text-xs text-slate-400 mt-1">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="space-y-1 p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedConvId === conv.id
                  ? "bg-emerald/20 border border-emerald"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{conv.contactName || conv.contactPhone}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">{conv.lastMessage || "No messages yet"}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-emerald text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.lastMessageTime && (
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(conv.lastMessageTime).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              No conversations yet. Messages from your WhatsApp contacts will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Main - Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-line bg-black flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{selectedConv.contactName || selectedConv.contactPhone}</h3>
                <p className="text-xs text-slate-400">{selectedConv.contactPhone}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">{error}</div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-emerald text-black"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-black/70" : "text-slate-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10">
                  No messages yet. Start the conversation.
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-line bg-black">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !sending && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="bg-emerald text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald/90 disabled:opacity-50"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <p className="text-lg">No conversation selected</p>
              <p className="text-sm mt-2">Click a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
