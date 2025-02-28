// components/chat/Sidebar/ConversationList.jsx
import React from "react";
import bookmarkedStar from "../../../assets/bookmarked.png";
import nonBookmarkedStar from "../../../assets/non-bookmarked.png";
import deleteIcon from "../../../assets/delete.png";
import { getFormattedDate } from "../utils/formatters";

const ConversationList = ({
  conversations,
  currentConversationId,
  switchConversation,
  toggleBookmark,
  isBookmarked,
  deleteConversation
}) => {
  return (
    <div className="history-list">
      {conversations
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .map(item => (
          <div
            key={item.id}
            className={`history-item ${item.id === currentConversationId ? 'active' : ''}`}
            onClick={() => switchConversation(item.id)}
          >
            <div className="history-item-content">
              <span className="history-title">{item.title || "Untitled"}</span>
              <span className="history-date">{getFormattedDate(item.timestamp)}</span>
            </div>
            <div className="history-actions">
              <button
                className={`bookmark-button ${isBookmarked(item.id) ? 'active' : ''}`}
                onClick={(e) => toggleBookmark(item.id, e)}
                title={isBookmarked(item.id) ? "Remove bookmark" : "Add bookmark"}
              >
                <img
                  src={isBookmarked(item.id) ? bookmarkedStar : nonBookmarkedStar}
                  alt={isBookmarked(item.id) ? "Bookmarked" : "Not Bookmarked"}
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
  );
};

export default ConversationList;