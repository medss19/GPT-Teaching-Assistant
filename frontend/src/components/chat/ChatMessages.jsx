import React, { useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import WelcomeMessage from "./WelcomeMessage";

const ChatMessages = ({ messages, isLoading, messagesEndRef }) => {
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const chatContainerRef = useRef(null);
  const lastScrollPositionRef = useRef(0);
  const scrollTimerRef = useRef(null);
  
  // More sensitive scroll detection
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    // Clear any pending scroll timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // More generous threshold
    
    // Compare with previous position to determine scroll direction
    const isScrollingUp = scrollTop < lastScrollPositionRef.current;
    lastScrollPositionRef.current = scrollTop;
    
    // If user is actively scrolling up, mark it immediately
    if (isScrollingUp && !isAtBottom) {
      setUserHasScrolled(true);
    }
    
    // If at bottom, mark that user is no longer scrolled up, but with a delay
    // to prevent interference with natural scroll momentum
    if (isAtBottom) {
      scrollTimerRef.current = setTimeout(() => {
        setUserHasScrolled(false);
      }, 100);
    }
  };
  
  // Auto-scroll only when appropriate
  useEffect(() => {
    const hasMessages = messages.length > 0;
    const lastMessage = hasMessages ? messages[messages.length - 1] : null;
    const isNewMessage = hasMessages && lastMessage && 
                         (lastMessage.sender === "assistant" || 
                          lastMessage.sender === "system");
    
    // Auto-scroll in these cases:
    // 1. User hasn't manually scrolled up OR
    // 2. This is a brand new message (not streaming update)
    if ((!userHasScrolled || !lastMessage?.isStreaming) && messagesEndRef.current && isNewMessage) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      });
    }
  }, [messages, isLoading, messagesEndRef, userHasScrolled]);

  // Ensure good initial scroll position
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
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
      <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
    </div>
  );
};

export default ChatMessages;