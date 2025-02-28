async function getLeetCodeProblem(titleSlug) {
//     const url = "https://leetcode.com/graphql";

//     const query = {
//         query: `
//         query getQuestionDetail($titleSlug: String!) {
//             question(titleSlug: $titleSlug) {
//                 questionId
//                 title
//                 difficulty
//                 content
//                 topicTags {
//                     name
//                 }
//             }
//         }`,
//         variables: { titleSlug }
//     };

//     try {
//         const response = await axios.post(url, query, {
//             headers: { "Content-Type": "application/json" }
//         });

//         const data = response.data?.data?.question;

//         if (!data) {
//             console.log("Problem not found.");
//             return null;
//         }

//         return {
//             id: data.questionId,
//             title: data.title,
//             difficulty: data.difficulty,
//             tags: data.topicTags.map(tag => tag.name),
//             content: data.content.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
//         };

//     } catch (error) {
//         console.error("Error fetching problem:", error.message);
//         return null;
//     }
// }