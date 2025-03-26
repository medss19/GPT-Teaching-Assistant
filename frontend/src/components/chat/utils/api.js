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
export const callGeminiAPI = async (leetcodeUrl, userDoubt, isNewConversation = false, conversationId, codeSnippet = null) => {
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

        if (codeSnippet) {
            const codeAnalysis = analyzeCodeSubmission(codeSnippet);
            const codeContextPrompt = `
## Code Submission Analysis
Concept Identified: ${codeAnalysis.conceptIdentified}
Potential Improvements: 
${codeAnalysis.potentialImprovements.join('\n')}

Guiding Questions:
${codeAnalysis.learningQuestions.join('\n')}
            `;

            await chatSessions[conversationId].sendMessage(codeContextPrompt);
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

        // Get the full response text
        const result = await chatSessions[conversationId].sendMessage(userMessage);
        const fullText = result.response.text();

        // Return a more advanced stream handler
        return {
            text: fullText,
            streamFunction: (callback) => {
                let currentIndex = 0;
                const chunkSize = 5;  // Characters per chunk
                const baseInterval = 30;  // Base interval between chunks

                const streamChunk = () => {
                    if (currentIndex >= fullText.length) {
                        callback(null);  // Signal end of stream
                        return;
                    }

                    // Vary chunk size and interval for more natural typing
                    const variableChunkSize = Math.floor(Math.random() * chunkSize) + 1;
                    const nextIndex = Math.min(
                        currentIndex + variableChunkSize,
                        fullText.length
                    );

                    const chunk = fullText.substring(currentIndex, nextIndex);
                    callback(chunk);
                    currentIndex = nextIndex;

                    // If all content is streamed, stop
                    if (currentIndex >= fullText.length) {
                        callback(null);  // Signal end of stream
                        return;
                    }

                    // Use requestAnimationFrame for smoother rendering
                    requestAnimationFrame(() => {
                        const variableInterval = baseInterval + Math.random() * 20;
                        setTimeout(streamChunk, variableInterval);
                    });
                };

                // Start the stream
                streamChunk();

                // Return a no-op cleanup function since streaming completes automatically
                return () => {};
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
// ... (existing formatting instructions) ...
    `);

    // Add problem-specific prompts if URL is provided
    if (leetcodeUrl) {
        promptParts.push(createProblemAnalysisPrompt(leetcodeUrl));
    }

    // Add doubt-specific prompt if user has a specific question
    if (userDoubt) {
        promptParts.push(createDoubtResponsePrompt(userDoubt));
    }

    // Add implementation guidance
    promptParts.push(createImplementationGuidancePrompt());

    // Add similar problems exploration
    promptParts.push(createSimilarProblemsPrompt());
    
    // ... (rest of the existing code) ...

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

// Add these functions near the bottom of api.js

/**
 * Analyzes code submission to identify DSA concepts
 * @param {string} codeSnippet - The submitted code
 * @returns {Object} Analysis results
 */
export const analyzeCodeSubmission = (codeSnippet) => {
    // Use pattern library for concept detection
    const concept = detectDSAConcept(codeSnippet);

    return {
        conceptIdentified: concept,
        potentialImprovements: [
            getDataStructureHint(concept),
            getAlgorithmPatternHint(concept)
        ],
        learningQuestions: [
            getRandomQuestion('socraticQuestions')
        ]
    };
};

/**
 * Detects the primary DSA concept in a code snippet
 * @param {string} codeSnippet - The code to analyze
 * @returns {string} Detected DSA concept
 */
const detectDSAConcept = (codeSnippet) => {
    // Implement basic pattern matching
    const conceptPatterns = {
        'Two Pointer': /two\s*pointers?/i,
        'Sliding Window': /sliding\s*window/i,
        'Dynamic Programming': /dp|dynamic\s*programming/i,
        'Recursion': /recursive|recursion/i,
        'Hash Map': /hash\s*map|dictionary/i,
        'Stack': /stack\s*implementation/i,
        'Queue': /queue\s*implementation/i
    };

    for (const [concept, pattern] of Object.entries(conceptPatterns)) {
        if (pattern.test(codeSnippet)) {
            return concept;
        }
    }

    return 'Generic Algorithm';
};