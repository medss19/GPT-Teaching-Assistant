// components/chat/Sidebar/BookmarkedList.jsx
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
  return (
    <div className="bookmarks-section">
      <h3>Bookmarked</h3>
      <div className="history-list bookmarks">
        {bookmarks.map(item => (
          <div
            key={item.id}
            className={`history-item ${item.id === currentConversationId ? 'active' : ''}`}
            onClick={() => switchConversation(item.id)}
          >
            <span className="history-title">
              {item.title || "Untitled"}
            </span>
            <span className="history-date">{getFormattedDate(item.timestamp)}</span>
            <div className="history-actions">
              <button
                className="bookmark-button active"
                onClick={(e) => toggleBookmark(item.id, e)}
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
                onClick={(e) => deleteConversation(item.id, e)}
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