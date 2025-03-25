// ChatHome.tsx
import React, { useState } from "react";
import "./Home.css";

const Home: React.FC = () => {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("English");
  const [searchUser, setSearchUser] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(`Message Sent: ${message} in ${language}`);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Chats</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <div className="chat-header">
          <h2>Chat</h2>
          <select
            className="language-dropdown"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <div className="chat-messages">
          <p className="incoming-message">Hello! How are you?</p>
          <p className="outgoing-message">I'm good! How about you?</p>
        </div>

        <div className="chat-input">
          <textarea
            className="message-box"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="send-button" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
