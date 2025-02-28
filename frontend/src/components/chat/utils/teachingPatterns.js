// teachingPatterns.js - Use these patterns for enhancing responses

export const patternLibrary = {
    // Problem understanding patterns
    problemBreakdown: [
      "What is the problem asking us to find or calculate?",
      "What are the input constraints?",
      "What patterns in the input should we pay attention to?",
      "Can we restate this problem in simpler terms?",
      "What would a minimal working example look like?"
    ],
    
    // Data structure selection patterns
    dataStructureHints: {
      array: "Consider how arrays provide O(1) access when index is known. Would that help here?",
      hashMap: "When we need to check for existence or retrieve values quickly, hash maps offer O(1) lookup.",
      stack: "Does the problem involve processing elements in a last-in, first-out manner?",
      queue: "Is the order of processing important? Should we handle elements first-in, first-out?",
      heap: "Do we need to repeatedly find the minimum/maximum element efficiently?",
      tree: "Is there a hierarchical relationship in the data? Or do we need to eliminate half our options at each step?",
      graph: "Are there relationships between elements that form a network structure?"
    },
    
    // Algorithm pattern recognition
    algorithmPatterns: {
      twoPointer: "Could we use two pointers moving through the array to find relationships between elements?",
      slidingWindow: "Can we maintain a window of elements and slide it through the data to find patterns?",
      binarySearch: "If the data is sorted (or can be sorted), could we eliminate half the possibilities in each step?",
      dfs: "Would exploring paths as deeply as possible before backtracking help solve this problem?",
      bfs: "Should we explore all possibilities at one level before moving deeper?",
      dynamicProgramming: "Are there overlapping subproblems where we calculate the same thing multiple times?",
      greedy: "Can we make locally optimal choices at each step to reach a global optimum?",
      divideConquer: "Can we break this into smaller subproblems, solve them independently, and combine the results?"
    },
    
    // Implementation guidance patterns
    pseudocodeTemplates: {
      iterative: `\`\`\`pseudocode
  function solve(input):
      initialize data structures
      for each element in input:
          process element
          update state
      return result
  \`\`\``,
      recursive: `\`\`\`pseudocode
  function solve(input):
      // Base case
      if input meets end condition:
          return base value
      
      // Recursive case
      return operation_with(solve(modified_input))
  \`\`\``,
      binarySearch: `\`\`\`pseudocode
  function binarySearch(array, target):
      left = 0
      right = array.length - 1
      
      while left <= right:
          mid = left + (right - left) / 2
          
          if array[mid] == target:
              return mid
          else if array[mid] < target:
              left = mid + 1
          else:
              right = mid - 1
              
      return -1  // Not found
  \`\`\``,
      dynamicProgramming: `\`\`\`pseudocode
  function solveDp(input):
      initialize dp array/table
      
      // Base cases
      dp[0] = base_value
      
      // Fill dp table
      for i from 1 to n:
          dp[i] = calculation based on previous dp values
      
      return dp[n]
  \`\`\``,
    },
    
    // Time/space complexity explanations
    complexityExplanations: {
      constant: "O(1) - The algorithm takes the same amount of time regardless of input size.",
      linear: "O(n) - The time grows linearly with input size, often from a single pass through the data.",
      logarithmic: "O(log n) - The algorithm reduces the problem size by a constant factor at each step, like binary search.",
      linearithmic: "O(n log n) - Common in efficient sorting algorithms like merge sort and heap sort.",
      quadratic: "O(n²) - Often seen with nested loops iterating through the input.",
      exponential: "O(2ⁿ) - The algorithm's time doubles with each additional element, often in recursive solutions without memoization."
    },
    
    // Question templates to encourage thinking
    socraticQuestions: [
      "What happens if we try a small example first?",
      "Can you identify any patterns in the expected output?",
      "What edge cases should we consider?",
      "Could we solve a simpler version of this problem first?",
      "What's the most expensive operation in your current approach?",
      "Is there a way to avoid recalculating the same values?",
      "How would you explain your approach to someone else?",
      "What's the invariant in each step of your algorithm?"
    ]
  };
  
  export const getRandomQuestion = (category) => {
    const questions = patternLibrary[category];
    return questions[Math.floor(Math.random() * questions.length)];
  };
  
  export const getDataStructureHint = (dataStructure) => {
    return patternLibrary.dataStructureHints[dataStructure] || 
      "Consider which data structure would be most efficient for the operations you need.";
  };
  
  export const getAlgorithmPatternHint = (pattern) => {
    return patternLibrary.algorithmPatterns[pattern] || 
      "Think about which algorithmic pattern might be most appropriate for this problem.";
  };
  
  export const getPseudocodeTemplate = (type) => {
    return patternLibrary.pseudocodeTemplates[type] || patternLibrary.pseudocodeTemplates.iterative;
  };
  
  export const getComplexityExplanation = (complexity) => {
    return patternLibrary.complexityExplanations[complexity] || 
      "Consider the time and space requirements as the input size grows.";
  };