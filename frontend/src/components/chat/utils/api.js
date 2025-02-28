import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
    createBasePrompt, 
    createProblemAnalysisPrompt, 
    createDoubtResponsePrompt,
    createImplementationGuidancePrompt,
    createSimilarProblemsPrompt
} from "./systemPrompts";

let lastLeetCodeUrl = null; // Store the last used LeetCode URL

/**
 * Calls the Gemini API with appropriate prompts based on the provided inputs
 * @param {string} leetcodeUrl - The LeetCode problem URL
 * @param {string} userDoubt - The user's specific question or doubt
 * @returns {Promise<string>} - The response from the Gemini API
 */
export const callGeminiAPI = async (leetcodeUrl, userDoubt) => {
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

        console.log("Starting chat session with Gemini AI");
        const chatSession = model.startChat({ generationConfig, history: [] });

        // Update lastLeetCodeUrl if a new URL is provided
        if (leetcodeUrl) {
            lastLeetCodeUrl = leetcodeUrl;
        }

        // Build the system prompt based on available inputs
        const systemPrompt = buildSystemPrompt(leetcodeUrl || lastLeetCodeUrl, userDoubt);

        console.log("Sending message to Gemini AI...");
        const result = await chatSession.sendMessage(systemPrompt);
        console.log("Response received from Gemini AI...");
        return result.response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`${error.message || "Unknown error"}`);
    }
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
    if (leetcodeUrl && userDoubt) {
        // Both URL and doubt provided
        promptParts.push(createProblemAnalysisPrompt(leetcodeUrl));
        promptParts.push(createDoubtResponsePrompt(userDoubt));
        promptParts.push(createImplementationGuidancePrompt());
        promptParts.push(createSimilarProblemsPrompt());
        promptParts.push(`
## Teaching Approach

You are a supportive DSA mentor who:
- Guides students toward discovering solutions themselves
- Uses the Socratic method to stimulate critical thinking
- Provides just enough hints without solving problems entirely
- Shows empathy and encouragement when students struggle
- Uses concrete examples to illustrate abstract concepts
- Connects new problems to fundamental principles the student already knows

Keep your tone friendly, encouraging, and conversational - like a knowledgeable peer rather than a distant instructor.
        `);
    } else if (leetcodeUrl) {
        // Only URL provided
        promptParts.push(createProblemAnalysisPrompt(leetcodeUrl));
        promptParts.push(`
## Initial Assessment

Since the student hasn't specified a particular doubt, help them get started by:

1. Providing a clear, concise explanation of the problem
2. Breaking down the problem into its core components
3. Suggesting an approach to understanding and solving it
4. Asking specific questions to guide their thinking

Structure your response with clear headings and visual hierarchy.
        `);
    } else if (userDoubt) {
        // Only doubt provided
        if (lastLeetCodeUrl) {
            promptParts.push(createProblemAnalysisPrompt(lastLeetCodeUrl));
        }
        promptParts.push(createDoubtResponsePrompt(userDoubt));
        promptParts.push(`
## Focused Guidance

Address the student's specific question by:

1. Breaking down the concept step-by-step with clear headings
2. Using concrete examples with properly formatted code
3. Connecting to fundamental DS&A principles
4. Visualizing the concept through clear explanations

Make your response visually engaging and easy to follow.
        `);
    }

    // Add example response structure template
    promptParts.push(`
# [Problem Title]
## Understanding the Problem
[Clear explanation of what the problem is asking]
## Key Insights
[Core concepts or patterns needed to solve this problem]
## Approach
[Step-by-step strategy for solving]
## Implementation Guidance
[Pseudocode or implementation considerations]
## Complexity Analysis
[Time and space complexity discussion]
## Follow-up Questions
[Thought-provoking questions to deepen understanding]
    `);
    
    // Add a reminder about user-friendly, modern response style
    promptParts.push(`
# Final Styling Reminder

Your response should look like it comes from a modern, polished educational platform:

- Professional yet friendly tone
- Visually appealing structure
- Consistent formatting throughout
- Clear information hierarchy
- Proper syntax highlighting for all code
- Balanced use of formatting (don't overuse bold/italics)
- Strategic use of white space for readability

Always end with a thought-provoking question that encourages deeper thinking about the concept.
    `);

    return promptParts.join("\n\n");
};