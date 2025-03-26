import React, { useState } from "react";
import "../Chat.css";
import "./Sidebar/Sidebar.css";
import "./ChatHeader.css";
import "./ChatInput.css";
import "./Welcome.css";
import "./CodeEditor.css"; // Import the new CSS
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import CodeEditor from "./CodeEditor"; // Import the new component
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

  // State for code editor
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  
  // Toggle sidebar
  const toggleSidebar = (e) => {
    if (e) {
      e.stopPropagation(); // Prevent event bubbling
    }
    setIsSidebarOpen(prev => !prev);
  };
  
  // Toggle code editor
  const toggleCodeEditor = () => {
    setIsCodeEditorOpen(prev => !prev);
  };
  
  // Handle code submission
  const handleCodeSubmit = (code, language, question = "Can you explain this code?") => {
    // Format the code question for the chat
    const codeQuestion = `
  I have a question about the following ${language} code:
  
  \`\`\`${language}
  ${code}
  \`\`\`
  
  ${question}
    `;
    
    // Set the doubt with the formatted code question
    setDoubt(codeQuestion.trim());
    
    // Close the code editor
    setIsCodeEditorOpen(false);
    
    // Optional: Auto-submit the question
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  // Determine main content width based on sidebar and code editor visibility
  const mainContentClass = `chat-wrapper ${isSidebarOpen ? 'sidebar-open' : ''} ${isCodeEditorOpen ? 'code-editor-open' : ''}`;

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
      <div className={mainContentClass}>
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
            onCodeButtonClick={toggleCodeEditor} // New prop
          />
        </div>
      </div>
      
      {/* Code editor panel */}
      <CodeEditor 
        isOpen={isCodeEditorOpen}
        onClose={toggleCodeEditor}
        onSubmit={handleCodeSubmit}
      />
    </div>
  );
};

export default Chat;