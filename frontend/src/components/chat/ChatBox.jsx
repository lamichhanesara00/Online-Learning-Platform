import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useUserData } from "../../context/UserContext";
import { IoSend } from "react-icons/io5";
import { IoMdClose, IoMdChatbubbles } from "react-icons/io";
import "./chatbox.css";

const ChatBox = ({ selectedReceiverId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const { user } = useUserData();
  const server = "http://localhost:5000";
  const [receiverId, setReceiverId] = useState(null);

  /** ✅ 1. Set Receiver ID Dynamically */
  useEffect(() => {
    if (user?._id) {
      setReceiverId(selectedReceiverId || "65d4af1234567890abcdef12");
      console.log("🔄 Receiver ID Set:", selectedReceiverId || "65d4af1234567890abcdef12");
    }
  }, [user, selectedReceiverId]);

  /** ✅ 2. Fetch Messages */
  useEffect(() => {
    if (user?._id && receiverId) {
      fetchMessages();
    }
  }, [user, receiverId]);

  const fetchMessages = async () => {
    if (!user?._id || !receiverId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${server}/api/chat/${user._id}/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessages(response.data.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error("❌ Error fetching messages:", error.response?.data || error.message);
    }
  };

  /** ✅ 3. Send Message */
  const sendMessage = async () => {
    if (!user?._id || !receiverId || newMessage.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${server}/api/chat`,
        { senderId: user._id, receiverId, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log("📤 Message sent:", response.data.message);
        
        // ✅ Fetch updated messages instead of manually adding
        setNewMessage("");
        fetchMessages(); // 🔄 Get latest messages after sending
      }
    } catch (error) {
      console.error("❌ Error sending message:", error.response?.data || error.message);
    }
  };

  /** ✅ 4. Auto-scroll to Bottom */
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // 🔄 Scroll when messages change

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chatbox-container">
      {!isOpen ? (
        <button className="chatbox-toggle" onClick={() => setIsOpen(true)}>
          <IoMdChatbubbles size={30} /> Chat
        </button>
      ) : (
        <div className="chatbox">
          <div className="chatbox-header">
            <h4>Live Chat</h4>
            <button onClick={() => setIsOpen(false)}>
              <IoMdClose size={20} />
            </button>
          </div>

          <div className="chatbox-messages">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg._id} className={`chat-message ${msg.senderId === user._id ? "sent" : "received"}`}>
                  <strong>{msg.senderId === user._id ? "You" : "Them"}:</strong> {msg.content}
                </div>
              ))
            ) : (
              <p className="no-messages">No messages yet. Start a conversation!</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>
              <IoSend size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
