import { useState, useRef, useEffect } from "react";
import { callGeminiAPI } from "../utils/api";

export const useChat = () => {
  const [url, setUrl] = useState("");
  const [doubt, setDoubt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const messagesEndRef = useRef(null);
  const doubtInputRef = useRef(null);

  // Load saved conversations, bookmarks, and clear old conversations on initial load
  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    }

    // Load bookmarks
    const savedBookmarks = JSON.parse(localStorage.getItem("bookmarkedChats")) || [];
    setBookmarks(savedBookmarks);

    // Load conversations and clean up old ones
    const savedConversations = JSON.parse(localStorage.getItem("conversations")) || [];
    const now = new Date().getTime();

    // Filter out conversations older than 3 days
    const filteredConversations = savedConversations.filter(
      conv => !conv.timestamp || (now - conv.timestamp < 3 * 24 * 60 * 60 * 1000)
    );

    setConversations(filteredConversations);

    // If there are conversations, set the current one to the most recent
    if (filteredConversations.length > 0) {
      const mostRecentConv = filteredConversations.reduce(
        (latest, conv) => (!latest.timestamp || (conv.timestamp > latest.timestamp)) ? conv : latest,
        filteredConversations[0]
      );
      setCurrentConversationId(mostRecentConv.id);
      setMessages(mostRecentConv.messages || []);
    } else {
      // Create a default conversation if none exist
      createNewConversation();
    }

    // Save filtered conversations back to localStorage
    localStorage.setItem("conversations", JSON.stringify(filteredConversations));
  }, []);

  // Save conversations whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save bookmarks whenever they change
  useEffect(() => {
    localStorage.setItem("bookmarkedChats", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  };

  // Auto-resize textarea
  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Create a new conversation
  const createNewConversation = () => {
    const newConversationId = Date.now().toString();
    const newConversation = {
      id: newConversationId,
      title: "New Conversation",
      messages: [],
      timestamp: Date.now()
    };

    setConversations(prevConversations => [...prevConversations, newConversation]);
    setCurrentConversationId(newConversationId);
    setMessages([]);
    setUrl("");
    setDoubt("");
  };

  // Switch to a different conversation
  const switchConversation = (conversationId) => {
    const selectedConversation = conversations.find(conv => conv.id === conversationId);
    if (selectedConversation) {
      setCurrentConversationId(conversationId);
      setMessages(selectedConversation.messages || []);
      // Close sidebar on mobile after selection
      setIsSidebarOpen(false);
    }
  };

  // Update conversation title based on first LeetCode problem or content
  const updateConversationTitle = (conversationId, messages) => {
    if (messages.length > 0 && messages[0].sender === "user") {
      let title = "Untitled Conversation";

      // Try to extract problem name from URL
      const problemMatch = messages[0].text.match(/Problem: (.*?)\/problems\/(.*?)(\/|$)/);
      if (problemMatch) {
        title = problemMatch[2].replace(/-/g, ' ');
      } else if (messages[0].text.includes("leetcode.com/problems/")) {
        // Try to extract directly from text
        const directMatch = messages[0].text.match(/leetcode\.com\/problems\/(.*?)(\/|$)/);
        if (directMatch) {
          title = directMatch[1].replace(/-/g, ' ');
        }
      } else {
        // Use first few words of the doubt as title
        const words = messages[0].text.split(' ');
        title = words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
      }

      // Update conversation with new title
      setConversations(prevConversations =>
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              title: title.charAt(0).toUpperCase() + title.slice(1)
            };
          }
          return conv;
        })
      );
    }
  };

  // Toggle bookmark for a conversation
  const toggleBookmark = (conversationId, event) => {
    if (event) {
      event.stopPropagation();
    }

    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;

    let updatedBookmarks = [...bookmarks];
    const isBookmarked = bookmarks.some(b => b.id === conversationId);

    if (isBookmarked) {
      // Remove from bookmarks
      updatedBookmarks = updatedBookmarks.filter(b => b.id !== conversationId);
    } else if (bookmarks.length < 2) {
      // Add to bookmarks (limit to 2)
      updatedBookmarks.push(conversation);
    } else {
      // Already have 2 bookmarks
      alert("You can only bookmark 2 conversations. Please remove one first.");
      return;
    }

    setBookmarks(updatedBookmarks);
  };

  // Check if a conversation is bookmarked
  const isBookmarked = (conversationId) => {
    return bookmarks.some(b => b.id === conversationId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url && !doubt) return; // Only require at least one field to be filled

    // Reset any previous error details
    setErrorDetails("");

    // Validate URL format if provided
    if (url && !url.includes("leetcode.com/problems/")) {
      setMessages(prevMessages => [...prevMessages, {
        text: "Please enter a valid LeetCode problem URL (e.g., https://leetcode.com/problems/two-sum/)",
        sender: "system"
      }]);
      return;
    }

    // Create a conversation if none exists
    if (!currentConversationId) {
      createNewConversation();
    }

    // Prepare user message
    let userText = "";
    if (url && doubt) {
      userText = `Problem: ${url}\nDoubt: ${doubt}`;
    } else if (url) {
      userText = `Problem: ${url}`;
    } else {
      userText = doubt;
    }

    const userMessage = {
      text: userText,
      sender: "user",
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update the conversation in state
    setConversations(prevConversations =>
      prevConversations.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: updatedMessages,
            timestamp: Date.now()
          };
        }
        return conv;
      })
    );

    // Update conversation title if it's the first message
    if (messages.length === 0) {
      updateConversationTitle(currentConversationId, updatedMessages);
    }

    setIsLoading(true);

    // Clear input fields after submission
    setUrl("");
    setDoubt("");

    // Reset textarea height
    if (doubtInputRef.current) {
      doubtInputRef.current.style.height = "auto";
    }

    try {
      console.log("Making call to Gemini API...");
      const responseText = await callGeminiAPI(url, doubt);

      const assistantMessage = {
        text: responseText,
        sender: "assistant",
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update the conversation with the assistant's response
      setConversations(prevConversations =>
        prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: finalMessages,
              timestamp: Date.now()
            };
          }
          return conv;
        })
      );

    } catch (error) {
      console.error("Error:", error);

      // Store detailed error information for debugging
      setErrorDetails(error.message || "Unknown error");

      const errorMessage = {
        text: `Sorry, there was an error processing your request: ${error.message}. Please check the console for more details.`,
        sender: "system",
        timestamp: Date.now()
      };

      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);

      // Update conversation with error message
      setConversations(prevConversations =>
        prevConversations.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: errorMessages,
              timestamp: Date.now()
            };
          }
          return conv;
        })
      );

    } finally {
      setIsLoading(false);
    }
  };

  // Delete a conversation
  const deleteConversation = (conversationId, event) => {
    if (event) {
      event.stopPropagation();
    }

    // Remove from bookmarks if bookmarked
    if (isBookmarked(conversationId)) {
      setBookmarks(prevBookmarks =>
        prevBookmarks.filter(b => b.id !== conversationId)
      );
    }

    // Remove from conversations
    setConversations(prevConversations =>
      prevConversations.filter(conv => conv.id !== conversationId)
    );

    // If we deleted the current conversation, switch to another one
    if (currentConversationId === conversationId) {
      const remainingConversations = conversations.filter(conv => conv.id !== conversationId);
      if (remainingConversations.length > 0) {
        const mostRecentConv = remainingConversations.reduce(
          (latest, conv) => (!latest.timestamp || (conv.timestamp > latest.timestamp)) ? conv : latest,
          remainingConversations[0]
        );
        switchConversation(mostRecentConv.id);
      } else {
        // Create a new conversation if none left
        createNewConversation();
      }
    }
  };

  return {
    url,
    setUrl,
    doubt,
    setDoubt,
    messages,
    isLoading,
    errorDetails,
    isSidebarOpen,
    setIsSidebarOpen,
    darkMode,
    toggleDarkMode,
    conversations,
    currentConversationId,
    bookmarks,
    messagesEndRef,
    doubtInputRef,
    handleTextareaInput,
    handleSubmit,
    createNewConversation,
    switchConversation,
    toggleBookmark,
    isBookmarked,
    deleteConversation
  };
};