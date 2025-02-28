import React, { useEffect } from "react";
import MessageItem from "./MessageItem";
import WelcomeMessage from "./WelcomeMessage";

const ChatMessages = ({ messages, isLoading, messagesEndRef }) => {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, messagesEndRef]);

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <WelcomeMessage />
      ) : (
        messages.map((msg, index) => (
          <MessageItem key={index} message={msg} />
        ))
      )}
      {isLoading && (
        <div className="message assistant">
          <div className="avatar">🤖</div>
          <div className="message-content loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;