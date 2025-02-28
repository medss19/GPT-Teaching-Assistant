import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLeetCodeProblem } from "../../../../demo";

let lastLeetCodeUrl = null; // Store the last used LeetCode URL

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

        let systemPrompt = "";

        if (leetcodeUrl && userDoubt) {
            // Both URL and doubt provided
            systemPrompt = ` 
            Talk Like a teacher.
            A student has shared a LeetCode problem: ${leetcodeUrl}
            Along with their specific doubt: "${userDoubt}"

            Your task is to assist the student by guiding them toward a solution without directly providing the answer. Follow these steps:

            1. **Understand the Problem Statement** – Summarize the problem in simple terms, highlighting key constraints.
            2. **Break Down the Problem** – Provide thought-provoking questions to help the student break it into smaller steps.
            3. **Guide with Hints** – Offer conceptual hints related to the problem, such as algorithmic approaches (e.g., two-pointer, DP, BFS/DFS), without solving it for them.
            4. **Suggest Similar Problems** – Recommend related problems for practice.
            5. **Encourage Code Debugging** – If the student is stuck, ask about edge cases, efficiency concerns, and alternative approaches.
            `;

        } else if (leetcodeUrl) {
            // Only URL provided
            systemPrompt = `
            Talk Like a instructor.
            Never give code only give pseudocode
            A student has shared a LeetCode problem: ${leetcodeUrl}
            However, they have not provided a specific doubt.

            Your task is to guide the student toward solving this problem on their own. Follow these steps:

            1. **Summarize the Problem** – Explain the problem statement, inputs, and expected outputs in simple termsDon't write musch if studnet didn't specify only explain qiuestion and approx and asnwer his doubt if hes ask below mentioned then only tell him):.
            2. **Ask Probing Questions** – Encourage the student to think critically:
                - What approach do you think will work best?
                - Have you considered edge cases?
                - What is the time and space complexity of your approach?
            3. **Provide Conceptual Hints** – Suggest useful data structures or algorithms (e.g., sliding window, recursion, greedy).
            4. **Encourage Implementation** – If unsure, recommend starting with a brute-force approach and iterating toward optimization.
            `;

        } else if (userDoubt) {
            // Only doubt provided, use the last known LeetCode URL if available
            if (lastLeetCodeUrl) {
                systemPrompt = `
                Talk Like a instructor.
                Never give code only give pseudocode
                A student has asked the following question: "${userDoubt}"
                They previously shared a LeetCode problem: ${lastLeetCodeUrl}

                Your task is to provide meaningful guidance by ( Don't write musch if studnet didn't specify only explain qiuestion and approx and asnwer his doubt if hes ask below mentioned then only tell him):
                1. **Clarifying the Doubt** – If ambiguous, ask the student to clarify.
                2. **Identifying the Core Concept** – Determine the fundamental concept the student is struggling with (e.g., recursion, sorting, graph traversal).
                3. **Providing a Conceptual Explanation** – Explain the concept with examples and a step-by-step approach.
                4. **Suggesting Relevant LeetCode Problems** – Recommend problems categorized by difficulty (Easy/Medium/Hard).
                5. **Encouraging Exploration** – Suggest that the student implement the concept and return with specific issues.
                `;
            } else {
                systemPrompt = `
                Talk Like a instructor.
                Never give code only give pseudocode
                A student has asked the following question: "${userDoubt}"
                However, they have not provided a specific LeetCode problem URL.

                Your task is to provide meaningful guidance by(Don't write musch if studnet didn't specify only explain qiuestion and approx and asnwer his doubt if hes ask below mentioned then only tell him):):
                1. **Clarifying the Doubt** – If ambiguous, ask for more details.
                2. **Identifying the Core Concept** – Determine the fundamental concept the student is struggling with.
                3. **Providing Conceptual Explanation** – Offer simple examples and a structured explanation.
                4. **Suggesting Relevant LeetCode Problems** – Recommend similar problems to reinforce learning.
                5. **Encouraging Exploration** – Suggest trying an implementation and returning with issues.
                `;
            }
        }

        console.log("Sending message to Gemini AI...");
        const result = await chatSession.sendMessage(systemPrompt);
        console.log("Response received from Gemini AI...");
        return result.response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`${error.message || "Unknown error"}`);
    }
};
