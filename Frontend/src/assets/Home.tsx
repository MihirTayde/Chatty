// ChatHome.tsx
import React, { useState, useEffect } from "react";
import "./Home.css";
import axios, { AxiosResponse } from "axios";

interface User {
  _id: string;
  fullName: string;
  profilePhoto: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<NewMessage[]>([]);

  const handleSendMessage = async (): Promise<void> => {
    if (message.trim() && selectedUser) {
      console.log(
        `Message Sent: "${message}" to ${selectedUser.username} (${selectedUser._id}) in ${language}`
      );

      try {
        const messageSentResponse: AxiosResponse<MessageResponse> =
          await axios.post(
            `http://localhost:4000/sendMessage/${selectedUser._id}`,
            {
              message: message, // Use 'message' to match your backend's 'newMessage' structure
              withCredentials: true,
            }
          );
        console.log("User Message Response: ", messageSentResponse.data);
        if (
          messageSentResponse.data.success &&
          messageSentResponse.data.newMessage
        ) {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            messageSentResponse.data.newMessage,
          ]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // **TODO: Handle error (e.g., display an error message to the user)**
      }

      setMessage("");
    } else if (!selectedUser) {
      alert("Please select a user to send a message to.");
    }
  };

  const handleGetUser = async (): Promise<void> => {
    try {
      const response: AxiosResponse<{ success: boolean; users: User[] }> =
        await axios.get("http://localhost:4000/getUser", {
          withCredentials: true,
        });
      console.log("User Data:", response.data);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserClick = async (user: User): Promise<void> => {
    console.log(`User clicked: ${user.username} (${user._id})`);
    setSelectedUser(user);
    // **TODO: Implement logic to load messages for this user**
    try {
      const chatHistoryResponse: AxiosResponse<{
        success: boolean;
        messages: NewMessage[];
      }> = await axios.get(`http://localhost:4000/getMessages/${user._id}`, {
        withCredentials: true,
      });
      if (
        chatHistoryResponse.data.success &&
        chatHistoryResponse.data.messages
      ) {
        setChatMessages(chatHistoryResponse.data.messages);
      } else {
        setChatMessages([]); // Clear messages if fetching fails or returns empty
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setChatMessages([]); // Clear messages on error
    }
  };

  useEffect(() => {
    handleGetUser();
  }, []);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Hi</h2>
        <button>Logout</button>
        <input
          type="text"
          className="search-bar"
          placeholder="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <div>
          {users
            .filter((user) =>
              user.username.toLowerCase().includes(searchUser.toLowerCase())
            )
            .map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={selectedUser?._id === user._id ? "active-user" : ""}
              >
                {user.username}
              </div>
            ))}
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
          {chatMessages.map((msg) => (
            <p
              key={msg._id}
              className={
                msg.senderId === "YOUR_USER_ID" // Replace with the actual logged-in user's ID
                  ? "outgoing-message"
                  : "incoming-message"
              }
            >
              {msg.message}
            </p>
          ))}
          {!selectedUser && (
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
