import React, { useEffect, useRef, useState, useCallback } from "react";
import MessageItem from "./MessageItem";
import WelcomeMessage from "./WelcomeMessage";

const ChatMessages = ({ messages, isLoading, messagesEndRef }) => {
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [isScrollControlled, setIsScrollControlled] = useState(false);

  // Smooth scroll handler with enhanced control
  const smoothScrollToBottom = useCallback((behavior = 'smooth') => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior, 
        block: 'nearest',
        inline: 'start'
      });
    }
  }, []);

  // Advanced scroll management
  useEffect(() => {
    // Only auto-scroll if not user-controlled or if it's a new conversation
    if (!isScrollControlled || messages.length <= 1) {
      smoothScrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
    }
  }, [messages, isScrollControlled, smoothScrollToBottom]);

  // Scroll control handler
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User is considered in control if scrolled up significantly
    setIsScrollControlled(distanceFromBottom > 100);
  }, []);

  // Restore scroll control when new conversation starts
  useEffect(() => {
    if (messages.length <= 1) {
      setIsScrollControlled(false);
    }
  }, [messages]);

  return (
    <div 
      className="chat-messages overflow-y-auto" 
      ref={chatContainerRef}
      onScroll={handleScroll}
    >
      {messages.length === 0 ? (
        <WelcomeMessage />
      ) : (
        messages.map((msg, index) => (
          <MessageItem 
            key={`${msg.timestamp}-${index}`} 
            message={msg} 
            ref={index === messages.length - 1 ? lastMessageRef : null}
          />
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
      <div ref={messagesEndRef} className="h-0" />
    </div>
  );
};

export default ChatMessages;