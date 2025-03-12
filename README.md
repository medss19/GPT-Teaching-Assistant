# DSA Teaching Assistant

**Fun Fact:** Built this entire project from scratch in under 24 hours—because who needs sleep when there’s code to write? 😤🔥

A **Software Engineering Intern Assignment** that creates an interactive chat application UI functioning as a teaching assistant for Data Structures and Algorithms (DSA) problems. This application leverages GPT to provide guided assistance without revealing direct solutions.


https://github.com/user-attachments/assets/c356b553-eddb-4532-817d-88888432a8be


## Overview

This application allows users to:
- Submit LeetCode problem URLs
- Ask specific questions about DSA problems
- Receive guided hints and intuition-building responses
- Develop problem-solving skills through interactive dialogue

The GPT-powered teaching assistant is designed to help users understand problems better rather than providing ready-made solutions. It functions as a mentor that guides users toward developing their own solutions.

## Table of Contents

- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Architecture](#architecture)
- [Usage Guidelines](#usage-guidelines)
- [GPT Integration & Prompt Design](#gpt-integration--prompt-design)
- [Project Structure](#project-structure)

## Features

- **Interactive Chat Interface**: Clean, responsive UI for seamless interaction
- **Guided Learning**: Provides hints and guidance without direct solutions
- **Conversation Management**: Save, bookmark, and retrieve conversations
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Custom Prompting System**: Structured prompt engineering for effective learning
- **Markdown Support**: Properly formatted code snippets and explanations

## Setup Instructions

### Prerequisites

- Node.js (v14.0.0 or higher)
- NPM (v6.0.0 or higher)
- Gemini API key

### Installation

1. **Clone the Repository**
   ```sh
   git clone https://github.com/medss19/GPT-Teaching-Assistant.git
   cd GPT-Teaching-Assistant/frontend
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the `frontend` directory:
   ```sh
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

4. **Run Development Server**
   ```sh
   npm run dev
   ```

5. **Build for Production**
   ```sh
   npm run build
   npm run preview  # To preview the build
   ```

## Architecture

The application follows a modular React architecture built with Vite for optimal performance and developer experience.

### Core Components

```
App (Root)
├── Chat (Main Container)
│   ├── ChatHeader (Title & Controls)
│   ├── ChatMessages (Conversation Display)
│   │   └── MessageItem (Individual Messages)
│   └── ChatInput (User Input)
└── Sidebar (Navigation)
    ├── ConversationList (Chat History)
    └── BookmarkedList (Saved Conversations)
```

### Key Files and Their Functions

- **App.jsx**: Application entry point and routing
- **Chat.jsx**: Main container orchestrating the chat interface
- **useChat.js**: Custom hook managing chat state and logic
- **api.js**: API communication with the Gemini model
- **systemPrompts.js**: Structured prompts for GPT interaction
- **teachingPatterns.js**: Educational patterns for guiding users

### State Management

The application uses React's Context API and custom hooks to manage:
- Conversation history
- Current chat state
- Bookmarked conversations
- User preferences

## Usage Guidelines

### Starting a New Conversation

1. Click the "New Conversation" button in the sidebar
2. Enter a LeetCode problem URL in the input field:
   ```
   https://leetcode.com/problems/two-sum/
   ```
3. Type your specific doubt or question:
   ```
   I understand we need to find two numbers that add up to the target, but I'm not sure how to avoid the O(n²) approach
   ```
4. Press Enter or click the Send button

### Managing Conversations

- **Switch Conversations**: Click on any conversation in the sidebar
- **Bookmark**: Click the bookmark icon (limited to 2 bookmarks)
- **Delete**: Click the delete icon to remove a conversation
- **Dark Mode**: Toggle using the button in the chat header

## GPT Integration & Prompt Design

The application integrates with the Gemini API to leverage GPT capabilities for teaching assistance.

### Prompt Engineering

For a comprehensive explanation of our prompt engineering approach, please see our [DSA Teaching Assistant Prompt Guide](./Prompt%20Guide.md).

Prompts are carefully designed to:
1. **Analyze Problems**: Extract key information from LeetCode URLs
2. **Guide Rather Than Solve**: Help users discover solutions independently
3. **Build Intuition**: Develop problem-solving patterns and techniques
4. **Provide Analogies**: Explain complex concepts with relatable examples
5. **Encourage Reflection**: Ask questions that deepen understanding

### Sample Prompt Structure

```javascript
const basePrompt = `
You are a Data Structures and Algorithms (DSA) teaching assistant.
Your goal is to help the student understand the problem and develop their own solution.
NEVER provide the complete solution. Instead:
1. Help them understand the problem statement
2. Guide them to identify key patterns or algorithms
3. Provide small hints that build intuition
4. Ask leading questions to develop their problem-solving skills
`;
```

### API Integration

The application communicates with the Gemini API using:

```javascript
const callGeminiAPI = async (prompt) => {
  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });
    
    // Process and return response
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { error: true, message: 'Failed to get response' };
  }
};
```

## Project Structure

```
frontend/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── chat/             # Chat UI components
│   │   │   ├── Chat.jsx           # Main chat container
│   │   │   ├── ChatHeader.jsx     # Title and controls
│   │   │   ├── ChatInput.jsx      # User input handling
│   │   │   ├── ChatMessages.jsx   # Message display
│   │   │   ├── MessageItem.jsx    # Individual message rendering
│   │   │   └── WelcomeMessage.jsx # Initial instructions
│   │   ├── sidebar/          # Navigation components
│   │   │   ├── Sidebar.jsx         # Main sidebar container
│   │   │   ├── ConversationList.jsx # Chat history
│   │   │   └── BookmarkedList.jsx   # Saved conversations
│   │   └── utils/            # Helper functions
│   │       ├── api.js             # API communication
│   │       ├── formatters.jsx     # Text formatting utilities
│   │       ├── systemPrompts.js   # GPT prompt templates
│   │       └── teachingPatterns.js # Educational patterns
│   ├── hooks/
│   │   └── useChat.js        # Custom chat logic hook
│   ├── assets/               # Images and icons
│   ├── App.jsx               # Main application component
│   └── main.jsx              # Entry point
├── .env                      # Environment variables
├── package.json              # Dependencies
└── vite.config.js            # Build configuration
```

## Future Enhancements

- **Voice Input/Output**: Add speech recognition and text-to-speech for accessibility
- **Code Execution**: Allow users to run code snippets directly in the chat
- **Progress Tracking**: Monitor user improvement over time
- **Problem Recommendations**: Suggest relevant problems based on user interaction
- **Multiple GPT Models**: Allow switching between different teaching styles


### Known Issues

- **URL Request Repetition**: The chatbot may occasionally ask for a URL again even after you've already provided one.

- **Context Confusion**: Sometimes the chatbot may reference previous conversations and produce answers related to prior questions when responding to a new query.

- **Formula Formatting Limitations**: Complex mathematical notations (such as formulas with superscripts or special symbols) may display incorrectly or with formatting issues.

- **Limited Teaching Patterns**: The current teaching interaction patterns are limited in scope and could be expanded in future updates.

- **Occasional Glitches**: In rare instances, the conversation may experience a glitch that produces unrelated or unsolicited responses. If this occurs, restarting the application is recommended.

**Example**

![image](https://github.com/user-attachments/assets/6b4142aa-01fd-4b3b-90d7-2eb974c0ad17)


I have worked diligently to create a user-friendly and functional chatbot experience, with continuous improvements planned for future releases.

