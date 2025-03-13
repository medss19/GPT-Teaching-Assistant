import React from "react";
import BookmarkedList from "./BookmarkedList";
import ConversationList from "./ConversationList";
import { ChevronLeft } from "lucide-react"; // Import ChevronLeft icon for closing

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  createNewConversation,
  switchConversation,
  currentConversationId,
  conversations,
  toggleBookmark,
  isBookmarked,
  deleteConversation,
  bookmarks
}) => {
  // Function to prevent sidebar from closing when clicking inside
  const handleSidebarContentClick = (e) => {
    // This prevents clicks inside the sidebar from bubbling up
    e.stopPropagation();
  };

  return (
    <div 
      className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
      onClick={handleSidebarContentClick}
    >
      <div className="sidebar-header">
        <h2>Conversation History</h2>
        <button 
          className="close-sidebar" 
          onClick={toggleSidebar} 
          aria-label="Close sidebar"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="sidebar-content">
        <button className="new-chat-button" onClick={createNewConversation}>
          <span className="plus-icon">+</span> New Conversation
        </button>

        {/* Bookmarked conversations section */}
        {bookmarks.length > 0 && (
          <BookmarkedList
            bookmarks={bookmarks}
            currentConversationId={currentConversationId}
            switchConversation={switchConversation}
            toggleBookmark={toggleBookmark}
            deleteConversation={deleteConversation}
          />
        )}

        {/* Recent conversations section */}
        <br></br>
        <h3>Recent</h3>
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          switchConversation={switchConversation}
          toggleBookmark={toggleBookmark}
          isBookmarked={isBookmarked}
          deleteConversation={deleteConversation}
        />
      </div>
    </div>
  );
};

export default Sidebar;