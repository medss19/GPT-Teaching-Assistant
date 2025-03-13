import React, { useState, useRef } from "react";
import sendIcon from "../../assets/send.png";
import micIcon from "../../assets/mic.png"; // You'll need to add a microphone icon

const ChatInput = ({
  url,
  setUrl,
  doubt,
  setDoubt,
  handleSubmit,
  doubtInputRef,
  handleTextareaInput
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US'; // Set language

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      // Update only if we have a final result or good interim result
      if (event.results[0].isFinal || transcript.length > 5) {
        setDoubt(transcript);
        
        // Also trigger the textarea resize handling
        if (doubtInputRef.current) {
          const textareaEvent = { target: doubtInputRef.current };
          handleTextareaInput(textareaEvent);
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      stopListening();
    };

    recognitionRef.current.onend = () => {
      stopListening();
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Check if there's any content in the input fields
  const hasContent = url.trim() !== '' || doubt.trim() !== '';

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
                if (e.key === "Enter" && !e.shiftKey && hasContent) {
                  e.preventDefault(); // Prevents a new line
                  handleSubmit(e); // Submits the form
                }
              }}
            />
            <button 
              type="button" 
              className={`voice-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
            >
              <img src={micIcon} alt="Voice" className="mic-icon" />
            </button>
            {hasContent && (
              <button type="submit" className="send-button">
                <img src={sendIcon} alt="Send" className="send-icon" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;