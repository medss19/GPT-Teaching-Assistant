import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    createBasePrompt, 
    createProblemAnalysisPrompt, 
    createDoubtResponsePrompt,
    createImplementationGuidancePrompt,
    createSimilarProblemsPrompt
} from "./systemPrompts";
import { patternLibrary } from "./teachingPatterns";

// Store chat sessions by conversation ID instead of a single global session
const chatSessions = {};

/**
 * Calls the Gemini API with appropriate prompts based on the provided inputs
 * @param {string} leetcodeUrl - The LeetCode problem URL
 * @param {string} userDoubt - The user's specific question or doubt
 * @param {boolean} isNewConversation - Whether to start a new conversation
 * @param {string} conversationId - The ID of the current conversation
 * @returns {Promise<string>} - The response from the Gemini API
 */
export const callGeminiAPI = async (leetcodeUrl, userDoubt, isNewConversation = false, conversationId) => {
    try {
        // Validate conversation ID
        if (!conversationId) {
            throw new Error("Missing conversation ID");
        }

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Key not found");
            throw new Error("API key is missing. Please check your environment variables.");
        }

        console.log(`Working with conversation ID: ${conversationId}`);
        console.log("Initializing Gemini AI with API key");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const generationConfig = {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4096,
            responseMimeType: "text/plain",
        };

        // Always start a new chat session if explicitly requested or if one doesn't exist for this conversation
        if (isNewConversation || !chatSessions[conversationId]) {
            console.log(`Starting new chat session for conversation ID: ${conversationId}`);
            chatSessions[conversationId] = model.startChat({ generationConfig, history: [] });
            
            // Initialize with the system prompt
            const systemPrompt = buildSystemPrompt(leetcodeUrl, userDoubt);
            await chatSessions[conversationId].sendMessage(systemPrompt);
            console.log("System prompt sent to initialize conversation");
            
            // If LeetCode URL is provided, send a specific prompt to fetch problem details
            if (leetcodeUrl) {
                const problemContextPrompt = `Please provide a concise description of the problem at ${leetcodeUrl}. Include the key points like what the problem is asking for, the input/output format, and any constraints mentioned.`;
                await chatSessions[conversationId].sendMessage(problemContextPrompt);
                console.log("Problem context prompt sent");
            }
        }

        console.log(`Sending user message to Gemini API for conversation ID: ${conversationId}`);
        let userMessage = userDoubt || "Tell me about this problem";
        
        if (leetcodeUrl && !userDoubt) {
            userMessage = "Please explain the problem at " + leetcodeUrl + " in detail, including the problem statement, examples, constraints, and approach.";
        }
        
        // Return a stream handler instead of the full response
        const result = await chatSessions[conversationId].sendMessage(userMessage);
        return {
            text: result.response.text(),
            streamFunction: (callback) => {
                // This is a simulated stream since Gemini doesn't natively support streaming
                // We'll break the response into chunks and send them incrementally
                const fullText = result.response.text();
                let currentIndex = 0;
                
                const streamInterval = setInterval(() => {
                    // Send 1-3 characters at a time to simulate variable typing speed
                    const chunkSize = Math.floor(Math.random() * 3) + 1;
                    const chunk = fullText.substring(currentIndex, currentIndex + chunkSize);
                    currentIndex += chunkSize;
                    
                    callback(chunk);
                    
                    if (currentIndex >= fullText.length) {
                        clearInterval(streamInterval);
                        callback(null); // Signal end of stream
                    }
                }, 30); // Adjust timing for realistic typing speed
                
                return () => clearInterval(streamInterval); // Return cleanup function
            }
        };
     } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`${error.message || "Unknown error"}`);
    }
};

/**
 * Resets the chat session for a specific conversation ID
 * @param {string} conversationId - The ID of the conversation to reset
 */
export const resetChatSession = (conversationId) => {
    if (conversationId && chatSessions[conversationId]) {
        delete chatSessions[conversationId];
        console.log(`Chat session reset for conversation ID: ${conversationId}`);
    } else if (!conversationId) {
        // Clear all sessions if no specific ID provided
        Object.keys(chatSessions).forEach(id => delete chatSessions[id]);
        console.log("All chat sessions reset");
    }
};

/**
 * Builds the system prompt based on the available inputs
 * @param {string} leetcodeUrl - The LeetCode problem URL
 * @param {string} userDoubt - The user's specific question or doubt
 * @param {string} problemContent - Optional problem content (if available)
 * @returns {string} - The constructed system prompt
 */
const buildSystemPrompt = (leetcodeUrl, userDoubt, problemContent = null) => {
    // Start with the base prompt
    let promptParts = [createBasePrompt()];
    
    // Add formatting instructions first to prioritize their importance
    promptParts.push(`
# Response Formatting Instructions

You are a modern, user-friendly DSA teaching assistant that provides beautifully formatted responses. Your responses should be:

NEVER asnwer any other questions that are not related to DSA.

1. **Visually structured** with clear headings, subheadings, and white space
2. **Properly formatted** using consistent Markdown syntax
3. **Professionally styled** with appropriate use of bold, italics, lists, and code blocks
4. **Easy to scan** with information hierarchy that makes sense

## Code Formatting Requirements

Always format code correctly:

- Use \`inline code\` with single backticks for variable names, method names, and short snippets
- Use proper code blocks with language specification for longer code:

\`\`\`python
def example_function(parameter):
    # This is properly formatted code
    result = parameter * 2
    return result
\`\`\`

NEVER use apostrophes or quotes for code - always use proper Markdown backticks.

## Visual Hierarchy

Use heading levels consistently:
- # Main title (use only once per response)
- ## Major sections 
- ### Subsections
- #### Minor points

Use **bold** for emphasis on key concepts and *italics* for introducing terminology.

## Interactive Elements

End sections with thought-provoking questions to encourage student engagement and reflection.
    `);

    // Add appropriate sections based on inputs
    if (leetcodeUrl) {
        if (problemContent) {
            promptParts.push(`
## Problem Context
The following is the LeetCode problem from ${leetcodeUrl}:

${problemContent}

Please analyze this problem and be ready to answer questions about it.
            `);
        } else {
            // Fallback to URL-only prompt
            promptParts.push(createProblemAnalysisPrompt(leetcodeUrl));
            
            // Add enhanced instructions for LeetCode problems
            promptParts.push(`
## LeetCode Problem Handling

When responding to questions about LeetCode problems:
1. If I don't provide the full problem statement, first try to explain what the problem is about based on its name and URL
2. If asked to explain the problem, provide a detailed breakdown including:
   - Problem statement and objective
   - Input/output format and examples
   - Constraints and edge cases
   - Possible approaches (brute force and optimized)
3. Remember that I might ask follow-up questions about the same problem
4. Don't ask me to provide the problem statement - try to determine it from the problem name
            `);
        }
    }
    
    // Add an instruction about maintaining conversational flow
    promptParts.push(`
## Conversational Guidelines

- Do not give TOO long responses. Keep them a bit concise and to the point. Try to give responses with more graphics for visualization wherever possible.
- Maintain a natural conversation flow without repeating introductions in each response
- Remember previous context and build upon it in your responses
- Respond directly to the student's current question without reintroducing yourself
- Keep a friendly, supportive tone throughout the conversation
- Assume the student remembers previous exchanges and avoid repetition
- If I provide a LeetCode problem URL, NEVER ask me to provide the problem statement - instead explain what you know about the problem based on its name and URL
-If you are asked with any other kind of question other than DSA or leetcpde then don't answer, just tellthe user what you're supposed to do.

## Memory Instructions

- You MUST never answer any other questions that are not related to DSA. 
- You MUST remember that you're in a continuous conversation about data structures and algorithms
- If I provide a LeetCode URL, YOU must remember that we're discussing that specific problem ONLY within this conversation
- Do NOT reset your understanding when I provide only a URL without a specific question
- If I say "explain this problem to me in detail", you should understand "this problem" refers to the LeetCode problem I provided in THIS conversation only
- Your context is limited to THIS conversation only - you don't know anything about problems discussed in other conversations
    `);

    return promptParts.join("\n\n");
};

/**
 * Generates a title based on available inputs
 * @param {string} leetcodeUrl - The LeetCode problem URL
 * @param {string} userDoubt - The user's specific question or doubt
 * @returns {string} - The generated title
 */
export const generateTitle = (leetcodeUrl, userDoubt) => {
    // If both URL and doubt are provided
    if (leetcodeUrl && userDoubt) {
        // Extract problem name from URL
        const problemName = extractProblemNameFromUrl(leetcodeUrl);
        // Take a portion of the doubt for the title
        const shortenedDoubt = userDoubt.length > 20 ? 
            userDoubt.substring(0, 17) + '...' : 
            userDoubt;
        return `${problemName}: ${shortenedDoubt}`;
    }
    
    // If only URL is provided
    else if (leetcodeUrl) {
        return extractProblemNameFromUrl(leetcodeUrl);
    }
    
    // If only doubt is provided
    else if (userDoubt) {
        const words = userDoubt.split(' ');
        return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
    }
    
    // Default title if nothing is provided
    return "Untitled Conversation";
};

/**
 * Extracts the problem name or number from a LeetCode URL
 * @param {string} url - The LeetCode problem URL
 * @returns {string} - The extracted problem name or a default string
 */
const extractProblemNameFromUrl = (url) => {
    try {
        // Extract problem name from URL
        const problemMatch = url.match(/leetcode\.com\/problems\/(.*?)(\/|$)/);
        if (problemMatch && problemMatch[1]) {
            // Convert kebab-case to readable format
            return problemMatch[1]
                .replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
        return "LeetCode Problem";
    } catch (error) {
        console.error("Error extracting problem name:", error);
        return "LeetCode Problem";
    }
};