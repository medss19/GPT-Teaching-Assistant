// components/chat/Sidebar/Sidebar.jsx
import React from "react";
import BookmarkedList from "./BookmarkedList";
import ConversationList from "./ConversationList";

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
  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Conversation History</h2>
        <button className="close-sidebar" onClick={toggleSidebar}>&times;</button>
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