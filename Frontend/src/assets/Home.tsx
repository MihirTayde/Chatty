import React, { useState, useEffect } from "react";
import "./Home.css";
import axios, { AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  userName: string;
  loggedIn_UserEmail: string;
}

interface User {
  _id: string;
  fullName: string;
  preferredLanguage: string;  
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface NewMessage {
  senderId: string;
  receiverId: string;
  message: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MessageResponse {
  success: boolean;
  message: string;
  newMessage: NewMessage;
}

const Home: React.FC = () => {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("English");
  const [searchUser, setSearchUser] = useState("");
  const [AllUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<NewMessage[]>([]);
  const [loggedIn_UserName, setLoggedIn_UserName] = useState("");
  const [loggedIn_UserId, setLoggedIn_UserId] = useState<string>("");

  // Fetch logged in user's info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        console.log("Decoded Token:", decoded); // Log the decoded token to check its structure
        setLoggedIn_UserName(decoded.userName); // Set the username
        setLoggedIn_UserId(decoded.userId); // Corrected: Use userId instead of loggedIn_UserId
        console.log("Logged-in User ID:", decoded.userId); // Log the User ID
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("No token found in localStorage");
    }
  }, []);

  // Fetch all users
  const handleGetOtherUsers = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      const response = await axios.get("http://localhost:4000/getOtherUsers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAllUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    handleGetOtherUsers();
  }, []);

  // Send Message
  const handleSendMessage = async (): Promise<void> => {
    if (message.trim() && selectedUser) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const messageSentResponse: AxiosResponse<MessageResponse> =
          await axios.post(
            `http://localhost:4000/sendMessage/${selectedUser._id}`,
            {
              message,
              senderId: loggedIn_UserId, // Include senderId
              receiverId: selectedUser._id, // Include receiverId
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );

        if (
          messageSentResponse.data.success &&
          messageSentResponse.data.newMessage
        ) {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            messageSentResponse.data.newMessage,
          ]);
        }
      } catch (error: unknown) {
        console.error("Error sending message:", error);
      }

      setMessage("");
    } else if (!selectedUser) {
      alert("Please select a user to send a message to.");
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Prevent default to avoid creating a new line
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Fetch chat history
  const handleUserClick = async (user: User): Promise<void> => {
    setSelectedUser(user);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found.");
        return;
      }

      const chatHistoryResponse: AxiosResponse<{
        success: boolean;
        messages: NewMessage[];
      }> = await axios.get(`http://localhost:4000/getMessages/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (chatHistoryResponse.data.success) {
        setChatMessages(chatHistoryResponse.data.messages);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setChatMessages([]);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/LogOut",
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error: unknown) {
      console.error("Error in logging out:", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Hi {loggedIn_UserName}</h2>
        <button onClick={handleLogout}>Logout</button>
        <input
          type="text"
          className="search-bar"
          placeholder="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <div>
          {AllUsers.length > 0 ? (
            AllUsers.filter((user) =>
              user.username.toLowerCase().includes(searchUser.toLowerCase())
            ).map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={selectedUser?._id === user._id ? "active-user" : ""}
              >
                {user.username}
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <div className="chat-header">
          <h2>
            {selectedUser
              ? `Chat with ${selectedUser.username}`
              : "Select a User"}
          </h2>
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
          {selectedUser ? (
            chatMessages.map((msg) => (
              <p
                key={msg._id}
                className={
                  msg.senderId === loggedIn_UserId
                    ? "outgoing-message"
                    : "incoming-message"
                }
              >
                {msg.message}
              </p>
            ))
          ) : (
            <p>Select a user from the sidebar to start chatting.</p>
          )}
        </div>

        <div className="chat-input">
          <textarea
            className="message-box"
            placeholder={
              selectedUser
                ? `Type a message to ${selectedUser.username}...`
                : "Select a user to type a message"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!selectedUser}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
