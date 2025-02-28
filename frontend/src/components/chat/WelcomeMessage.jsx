// components/chat/WelcomeMessage.jsx
import React from "react";

const WelcomeMessage = () => {
  return (
    <div className="welcome-message">
      <h2>Welcome to DSA Teaching Assistant!</h2>
      <p>I'm here to help you learn Data Structures & Algorithms.</p>
      <div className="instructions">
        <h3>How to use:</h3>
        <ol>
          <li>Paste a LeetCode problem URL (optional)</li>
          <li>Describe your specific doubt or question</li>
          <li>Click the send button to get personalized help</li>
        </ol>
      </div>
      <div className="examples">
        <h3>Example questions you can ask:</h3>
        <ul>
          <li>"How do I identify if this is a dynamic programming problem?"</li>
          <li>"I'm stuck on finding an O(n) approach instead of the O(n²) solution"</li>
          <li>"What data structure would be most efficient for this problem?"</li>
        </ul>
      </div>
    </div>
  );
};

export default WelcomeMessage;