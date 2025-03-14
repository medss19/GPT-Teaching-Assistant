import React from "react";
import "../Chat.css";
import "./Sidebar/Sidebar.css";
import "./ChatHeader.css";
import "./ChatInput.css";
import "./Welcome.css";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import Sidebar from "./sidebar/Sidebar";
import { useChat } from "./hooks/useChat";

const Chat = () => {
  const {
    url,
    setUrl,
    doubt,
    setDoubt,
    messages,
    isLoading,
    errorDetails,
    isSidebarOpen,
    setIsSidebarOpen,
    darkMode,
    toggleDarkMode,
    handleSubmit,
    messagesEndRef,
    doubtInputRef,
    handleTextareaInput,
    createNewConversation,
    switchConversation,
    currentConversationId,
    conversations,
    toggleBookmark,
    isBookmarked,
    stopStreaming,
    isStreaming,
    deleteConversation,
    bookmarks
  } = useChat();

  const toggleSidebar = (e) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
      {/* Sidebar for conversation history */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        createNewConversation={createNewConversation}
        switchConversation={switchConversation}
        currentConversationId={currentConversationId}
        conversations={conversations}
        toggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
        deleteConversation={deleteConversation}
        bookmarks={bookmarks}
      />

      {/* Main chat area */}
      <div className={`chat-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-container">
          <ChatHeader 
            toggleSidebar={toggleSidebar} 
            toggleDarkMode={toggleDarkMode} 
            darkMode={darkMode} 
            errorDetails={errorDetails}
            isSidebarOpen={isSidebarOpen}
          />

          <ChatMessages 
            messages={messages} 
            isLoading={isLoading} 
            messagesEndRef={messagesEndRef} 
          />

          <ChatInput
            url={url}
            setUrl={setUrl}
            doubt={doubt}
            setDoubt={setDoubt}
            handleSubmit={handleSubmit}
            doubtInputRef={doubtInputRef}
            handleTextareaInput={handleTextareaInput}
            isStreaming={isStreaming}
            onStopStreaming={stopStreaming}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;