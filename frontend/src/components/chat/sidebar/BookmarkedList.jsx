import React from "react";
import bookmarkedStar from "../../../assets/bookmarked.png";
import deleteIcon from "../../../assets/delete.png";
import { getFormattedDate } from "../utils/formatters";

const BookmarkedList = ({
  bookmarks,
  currentConversationId,
  switchConversation,
  toggleBookmark,
  deleteConversation
}) => {
  // Prevent event propagation for conversation switching
  const handleConversationClick = (id, e) => {
    if (e) e.stopPropagation();
    switchConversation(id);
  };

  // Prevent event propagation for bookmark toggle
  const handleBookmarkClick = (id, e) => {
    e.stopPropagation();
    toggleBookmark(id, e);
  };

  // Prevent event propagation for conversation deletion
  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    deleteConversation(id, e);
  };

  return (
    <div className="bookmarks-section">
      <h3>Bookmarked</h3>
      <div className="history-list bookmarks">
        {bookmarks.map(item => (
          <div
            key={item.id}
            className={`history-item ${item.id === currentConversationId ? 'active' : ''}`}
            onClick={(e) => handleConversationClick(item.id, e)}
          >
            <div className="history-item-content">
              <span className="history-title">{item.title || "Untitled"}</span>
              <span className="history-date">{getFormattedDate(item.timestamp)}</span>
            </div>
            <div className="history-actions">
              <button
                className="bookmark-button active"
                onClick={(e) => handleBookmarkClick(item.id, e)}
                title="Remove bookmark"
              >
                <img
                  src={bookmarkedStar}
                  alt="Bookmarked"
                  className="bookmark-icon"
                />
              </button>

              <button
                className="delete-button"
                onClick={(e) => handleDeleteClick(item.id, e)}
                title="Delete conversation"
              >
                <img
                  src={deleteIcon}
                  alt="Delete"
                  className="delete-icon"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkedList;