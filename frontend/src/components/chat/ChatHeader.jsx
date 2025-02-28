import React from "react";

const ChatHeader = ({ toggleSidebar, toggleDarkMode, darkMode, errorDetails }) => {
  return (
    <div className="chat-header">
      <button className="menu-button" onClick={toggleSidebar}>
        ☰
      </button>
      <h1>DSA Teaching Assistant</h1>
      <div className="header-options">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {errorDetails && (
        <div className="error-banner">
          <p>Error details: {errorDetails}</p>
          <p>Please ensure your API key is correctly set in the .env file as VITE_GEMINI_API_KEY</p>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;