import React from "react"; 
import sendIcon from "../../assets/send.png"; 
 
const ChatInput = ({ 
  url, 
  setUrl, 
  doubt, 
  setDoubt, 
  handleSubmit, 
  doubtInputRef, 
  handleTextareaInput 
}) => { 
  return ( 
    <div className="chat-input-container"> 
      <form onSubmit={handleSubmit}> 
        <div className="chat-input-wrapper"> 
          <div className="url-input-wrapper"> 
            <input 
              id="leetcode-url" 
              type="text" 
              placeholder="Paste LeetCode problem URL here (optional)" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              className="url-input" 
            /> 
          </div> 
 
          <div className="doubt-input-container"> 
            <textarea 
              ref={doubtInputRef} 
              id="user-doubt" 
              className="doubt-input"
              placeholder="Describe your question or doubt..." 
              value={doubt} 
              onChange={(e) => { 
                setDoubt(e.target.value); 
                handleTextareaInput(e); 
              }} 
              onInput={handleTextareaInput} 
              onKeyDown={(e) => { 
                if (e.key === "Enter" && !e.shiftKey) { 
                  e.preventDefault();  // Prevents a new line 
                  handleSubmit(e);     // Submits the form 
                } 
              }} 
            /> 
            <button type="submit" className="send-button" disabled={!url && !doubt}> 
              <img src={sendIcon} alt="Send" className="send-icon" /> 
            </button> 
          </div> 
        </div> 
      </form> 
    </div> 
  ); 
}; 
 
export default ChatInput;