// Update MessageItem.jsx
import React, { useEffect, useState } from "react";
import userAvatar from "../../assets/user.png";
import { formatMessage } from "./utils/formatters";

const MessageItem = ({ message }) => {
  const [formattedContent, setFormattedContent] = useState(null);
  
  useEffect(() => {
    // Only rerender formatted content when the message text changes
    // or when streaming stops
    setFormattedContent(formatMessage(message.text));
  }, [message.text, message.isStreaming]);

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
        {formattedContent}
        {message.isStreaming && (
          <span className="cursor"></span>
        )}
      </div>
    </div>
  );
};

export default MessageItem;