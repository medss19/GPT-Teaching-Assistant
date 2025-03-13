import React from "react";
import { Menu, Sun, Moon, AlertCircle } from "lucide-react"; // Using lucide-react icons

const ChatHeader = ({ toggleSidebar, toggleDarkMode, darkMode, errorDetails, isSidebarOpen }) => {
  return (
    <div className="chat-header">
      <div className="header-left">
        {!isSidebarOpen && (
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar} 
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="header-title">
          <h1>DSA Teaching Assistant</h1>
          <span className="header-subtitle">Data Structures & Algorithms</span>
        </div>
      </div>
      
      <div className="header-options">
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode} 
          aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {errorDetails && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <div className="error-content">
            <p className="error-message">Error: {errorDetails}</p>
            <p className="error-help">Please ensure your API key is correctly set in the .env file as VITE_GEMINI_API_KEY</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;