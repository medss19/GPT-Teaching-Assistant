import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    createBasePrompt, 
    createProblemAnalysisPrompt, 
    createDoubtResponsePrompt,
    createImplementationGuidancePrompt,
    createSimilarProblemsPrompt
} from "./systemPrompts";
import { patternLibrary } from "./teachingPatterns";

let lastLeetCodeUrl = null; // Store the last used LeetCode URL
let persistentChatSession = null; // Store the chat session

/**
 * Calls the Gemini API with appropriate prompts based on the provided inputs
 * @param {string} leetcodeUrl - The LeetCode problem URL
 * @param {string} userDoubt - The user's specific question or doubt
 * @param {boolean} isNewConversation - Whether to start a new conversation
 * @returns {Promise<string>} - The response from the Gemini API
 */
export const callGeminiAPI = async (leetcodeUrl, userDoubt, isNewConversation = false) => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Key not found");
            throw new Error("API key is missing. Please check your environment variables.");
        }

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

        // Update lastLeetCodeUrl if a new URL is provided
        if (leetcodeUrl) {
            lastLeetCodeUrl = leetcodeUrl;
        }

        // Start a new chat session if this is a new conversation or there isn't one already
        if (isNewConversation || !persistentChatSession) {
            console.log("Starting new chat session with Gemini AI");
            persistentChatSession = model.startChat({ generationConfig, history: [] });
            
            // If this is a new conversation, initialize with the system prompt
            const systemPrompt = buildSystemPrompt(leetcodeUrl || lastLeetCodeUrl, null);
            await persistentChatSession.sendMessage(systemPrompt);
            console.log("System prompt sent to initialize conversation");
        }

        // For ongoing conversations, just send the user's doubt
        console.log("Sending user message to Gemini AI...");
        const userMessage = userDoubt || "Tell me about this problem";
        const result = await persistentChatSession.sendMessage(userMessage);
        console.log("Response received from Gemini AI...");
        return result.response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`${error.message || "Unknown error"}`);
    }
};

/**
 * Resets the chat session
 */
export const resetChatSession = () => {
    persistentChatSession = null;
    console.log("Chat session reset");
};

/**
 * Builds the system prompt based on the available inputs
 * @param {string} leetcodeUrl - The LeetCode problem URL
 * @param {string} userDoubt - The user's specific question or doubt
 * @returns {string} - The constructed system prompt
 */
const buildSystemPrompt = (leetcodeUrl, userDoubt) => {
    // Start with the base prompt
    let promptParts = [createBasePrompt()];
    
    // Add formatting instructions first to prioritize their importance
    promptParts.push(`
# Response Formatting Instructions

You are a modern, user-friendly DSA teaching assistant that provides beautifully formatted responses. Your responses should be:

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
        // URL provided
        promptParts.push(createProblemAnalysisPrompt(leetcodeUrl));
    }
    
    // Add an instruction about maintaining conversational flow
    promptParts.push(`
## Conversational Guidelines

- Maintain a natural conversation flow without repeating introductions in each response
- Remember previous context and build upon it in your responses
- Respond directly to the student's current question without reintroducing yourself
- Keep a friendly, supportive tone throughout the conversation
- Assume the student remembers previous exchanges and avoid repetition
    `);

    return promptParts.join("\n\n");
};