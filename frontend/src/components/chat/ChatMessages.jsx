import React, { useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import WelcomeMessage from "./WelcomeMessage";

const ChatMessages = ({ messages, isLoading, messagesEndRef }) => {
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const chatContainerRef = useRef(null);
  const scrollTimeout = useRef(null);
  const isAutoScrollingRef = useRef(false);
  
  // Handle scroll event
  const handleScroll = () => {
    if (!chatContainerRef.current || isAutoScrollingRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    
    if (isNearBottom) {
      setUserHasScrolled(false);
    } else {
      setUserHasScrolled(true);
    }
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const hasMessages = messages.length > 0;
    const lastMessage = hasMessages ? messages[messages.length - 1] : null;
    const isNewMessageBeingTyped = lastMessage?.isStreaming;
    
    // Don't scroll if user has manually scrolled up (unless it's a brand new conversation)
    if (messages.length <= 1 || !userHasScrolled || isNewMessageBeingTyped) {
      if (messagesEndRef.current) {
        // Set flag to prevent handling scroll events during auto-scrolling
        isAutoScrollingRef.current = true;
        
        messagesEndRef.current.scrollIntoView({ 
          behavior: messages.length === 1 ? "auto" : "smooth", 
          block: "end" 
        });
        
        // Clear the flag after scrolling completes
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 150);
      }
    }
  }, [messages, userHasScrolled]);
  
  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <div 
      className="chat-messages" 
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
      <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
    </div>
  );
};

export default ChatMessages;