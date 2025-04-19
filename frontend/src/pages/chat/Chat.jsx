import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSend, FiSearch } from "react-icons/fi";
import { format } from "date-fns";
import { LuSendHorizontal } from "react-icons/lu";
import { useUserData } from "../../context/UserContext";
import "./chat.css";

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const Chat = () => {
  const { isAuth, user, loading } = useUserData();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!loading && isAuth) {
      console.log(user.role);
      if (user.role !== "teacher" && user.role !== "admin") {
        navigate("/unauthorized");
      }
    } else if (!loading && !isAuth) {
      navigate("/login");
    }
  }, [isAuth, user, loading, navigate]);

  // Fetch students with conversations
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const {
          data: { data: fetchedStudents },
        } = await axios.get("http://localhost:5000/api/chat/students", {
          headers,
        });
        setStudents(fetchedStudents);

        if (fetchedStudents.length > 0 && !selectedStudent) {
          setSelectedStudent(fetchedStudents[0]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    if (isAuth && (user.role === "teacher" || user.role === "admin")) {
      fetchStudents();
    }
  }, [isAuth, user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedStudent) return;

      setLoadingMessages(true);
      try {
        const {
          data: { data: newMessages },
        } = await axios.get(
          `http://localhost:5000/api/chat/messages/${selectedStudent._id}`,
          { headers }
        );
        setMessages(newMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedStudent]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedStudent) return;

    setSendingMessage(true);
    try {
      const {
        data: { data: sentMessage },
      } = await axios.post(
        "http://localhost:5000/api/chat/messages",
        {
          receiverId: selectedStudent._id,
          content: newMessage,
        },
        { headers }
      );

      setMessages([...messages, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredStudents = searchTerm
    ? students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : students;

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), "MMM d, h:mm a");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      {/* Student List Sidebar */}
      <div className="student-list">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="students-container">
          {filteredStudents.length === 0 ? (
            <div className="no-students">No students found</div>
          ) : (
            filteredStudents?.map((student) => (
              <div
                key={student._id}
                className={`student-item ${
                  selectedStudent?._id === student._id ? "selected" : ""
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-info">
                  <div className="student-name">{student.name}</div>
                  <div className="last-message">
                    {student.lastMessage ? (
                      <>
                        <span className="message-preview">
                          {student.lastMessage.content.substring(0, 25)}
                          {student.lastMessage.content.length > 25 ? "..." : ""}
                        </span>
                        <span className="message-time">
                          {formatTimestamp(student.lastMessage.createdAt)}
                        </span>
                      </>
                    ) : (
                      <span className="no-messages">No messages yet</span>
                    )}
                  </div>
                </div>
                {student.unreadCount > 0 && (
                  <div className="unread-badge">{student.unreadCount}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {!selectedStudent ? (
          <div className="no-conversation">
            <div className="no-conversation-text">
              Select a student to start chatting
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-avatar">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{selectedStudent.name}</div>
                <div className="chat-header-status">
                  {selectedStudent.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {loadingMessages ? (
                <div className="loading-messages">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages-yet">
                  No messages yet. Start the conversation!
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

            {/* Message Input */}
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

export default Chat;
