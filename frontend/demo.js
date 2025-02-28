import axios from "axios";
import fs from "fs";

async function getLeetCodeProblem(titleSlug) {
    const url = "https://leetcode.com/graphql";

    const query = {
        query: `
        query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                title
                difficulty
                content
                topicTags {
                    name
                }
            }
        }`,
        variables: { titleSlug }
    };

    try {
        const response = await axios.post(url, query, {
            headers: { "Content-Type": "application/json" }
        });

        const data = response.data?.data?.question;

        if (!data) {
            console.warn(`LeetCode problem "${titleSlug}" not found.`);
            return null;
        }

        const problemDetails = `
Title: ${data.title}
Difficulty: ${data.difficulty}
Tags: ${data.topicTags.map(tag => tag.name).join(", ")}
Content: ${data.content.replace(/<\/?[^>]+(>|$)/g, "")} 
        `;

        // Overwrite the file with new problem details
        fs.writeFileSync("leetcode_problem.txt", problemDetails, "utf-8");

        return {
            id: data.questionId,
            title: data.title,
            difficulty: data.difficulty,
            tags: data.topicTags.map(tag => tag.name),
            content: data.content.replace(/<\/?[^>]+(>|$)/g, "")
        };

    } catch (error) {
        console.error("Error fetching problem:", error.message);
        return null;
    }
}

// Example usage
getLeetCodeProblem("two-sum").then(console.log);

export { getLeetCodeProblem };
