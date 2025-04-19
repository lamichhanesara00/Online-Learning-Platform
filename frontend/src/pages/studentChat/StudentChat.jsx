import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSend, FiSearch } from "react-icons/fi";
import { LuSendHorizontal } from "react-icons/lu";
import { format } from "date-fns";
import { useUserData } from "../../context/UserContext";
import "./studentChat.css";

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const StudentChat = () => {
  const { isAuth, user, loading } = useUserData();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!loading && isAuth) {
      if (user.role !== "student") {
        navigate("/unauthorized");
      }
    } else if (!loading && !isAuth) {
      navigate("/login");
    }
  }, [isAuth, user, loading, navigate]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/chat/teachers",
          {
            headers,
          }
        );
        setTeachers(response.data.data);

        if (response.data.data.length > 0 && !selectedTeacher) {
          setSelectedTeacher(response.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    if (isAuth && user.role === "student") {
      fetchTeachers();
    }
  }, [isAuth, user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedTeacher) return;

      setLoadingMessages(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/${user._id}/${selectedTeacher._id}`,
          { headers }
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedTeacher, user]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedTeacher) return;

    setSendingMessage(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat",
        {
          senderId: user._id,
          receiverId: selectedTeacher._id,
          content: newMessage,
        },
        { headers }
      );

      setMessages([...messages, response.data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredTeachers = searchTerm
    ? teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teachers;

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), "MMM d, h:mm a");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="student-chat-container">
      {/* Teacher List Sidebar */}
      <div className="teacher-list">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="teachers-container">
          {filteredTeachers.length === 0 ? (
            <div className="no-teachers">
              <p>No conversations found</p>
              <p className="help-text">
                Start a conversation with one of your course teachers
              </p>
            </div>
          ) : (
            filteredTeachers?.map((teacher) => (
              <div
                key={teacher._id}
                className={`teacher-item ${
                  selectedTeacher?._id === teacher._id ? "selected" : ""
                }`}
                onClick={() => setSelectedTeacher(teacher)}
              >
                <div className="teacher-avatar">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div className="teacher-info">
                  <div className="teacher-name">{teacher.name}</div>
                  <div className="last-message">
                    {teacher.lastMessage ? (
                      <>
                        <span className="message-preview">
                          {teacher.lastMessage.content.substring(0, 25)}
                          {teacher.lastMessage.content.length > 25 ? "..." : ""}
                        </span>
                        <span className="message-time">
                          {formatTimestamp(teacher.lastMessage.createdAt)}
                        </span>
                      </>
                    ) : (
                      <span className="no-messages">No messages yet</span>
                    )}
                  </div>
                </div>
                {teacher?.unreadCount > 0 && (
                  <div className="unread-badge">{teacher.unreadCount}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {!selectedTeacher ? (
          <div className="no-conversation">
            <div className="no-conversation-text">
              Select a teacher to start chatting
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-avatar">
                {selectedTeacher.name.charAt(0).toUpperCase()}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{selectedTeacher.name}</div>
                <div className="chat-header-status">
                  {selectedTeacher.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {loadingMessages ? (
                <div className="loading-messages">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages-yet">
                  No messages yet. Start the conversation with your teacher!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${
                      message.senderId === user._id ? "sent" : "received"
                    }`}
                  >
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {formatTimestamp(message.createdAt)}
                    </div>
                  </div>
                ))
              )}
              <div ref={messageEndRef} />
            </div>

            <form
              className="message-input-container"
              onSubmit={handleSendMessage}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sendingMessage}
                className="message-input"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="send-button"
              >
                <LuSendHorizontal color="white" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentChat;
