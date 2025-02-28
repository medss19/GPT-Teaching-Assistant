// components/chat/MessageItem.jsx
import React from "react";
import userAvatar from "../../assets/user.png";
import { formatMessage } from "./utils/formatters";

const MessageItem = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      <div className="avatar">
        {message.sender === "user" ? (
          <img src={userAvatar} alt="User" className="avatar-img" />
        ) : message.sender === "assistant" ? (
          "🤖"
        ) : (
          "⚠️"
        )}
      </div>
      <div className="message-content">
        {formatMessage(message.text)}
      </div>
    </div>
  );
};

export default MessageItem;