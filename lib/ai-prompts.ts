// Centralized file for AI prompts to ensure consistency and quality

export const prompts = {
  // Main content generation prompts
  contentGeneration: {
    explanation: (topic: any) => `
    You are an expert calculus professor creating educational content for "${topic.title}" from James Stewart's Calculus textbook.
    
    Topic Description: ${topic.description}
    
    Create a comprehensive explanation of this concept with the following characteristics:
    - Clear, concise language accessible to calculus students
    - Proper mathematical notation using LaTeX
    - Key definitions, theorems, and properties
    - Conceptual understanding beyond just formulas
    - Visual intuition where appropriate
    - Common misconceptions and how to avoid them
    - 3-4 paragraphs in length
    
    Use $ for inline math and $$ for display math. Format as clean HTML with proper mathematical expressions.
  `,

    example: (topic: any) => `
    Create a worked example problem for the calculus topic "${topic.title}" that demonstrates key concepts.
    
    The example should:
    - Be challenging but solvable with knowledge of this topic
    - Use proper LaTeX notation throughout
    - Include a clear problem statement
    - Provide a complete solution
    - Break down the solution into clear, logical steps
    
    Return a JSON object with this structure:
    {
      "problem": "A challenging worked example problem with proper LaTeX notation",
      "solution": "Complete detailed solution with proper mathematical formatting",
      "steps": [
        "Step 1: [First step with explanation]",
        "Step 2: [Second step with explanation]",
        "Step 3: [Third step with explanation]",
        "Step 4: [Additional steps as needed]"
      ]
    }
  `,

    practiceProblem: (topic: any, difficulty = "medium") => `
    Create a high-quality ${difficulty} difficulty practice problem for the calculus topic "${topic.title}".
    
    The problem should:
    - Test understanding of key concepts from this topic
    - Be challenging but solvable with proper knowledge
    - Use proper LaTeX notation throughout
    - Include a clear problem statement
    - Provide the correct answer
    - Include a helpful hint that guides without giving away the solution
    - Have a detailed step-by-step solution that explains each step thoroughly
    
    Return a JSON object with this structure:
    {
      "problem": "A well-crafted practice problem with proper LaTeX notation",
      "answer": "The correct answer (numerical or algebraic)",
      "hint": "A helpful hint that guides toward the solution method",
      "solution": "DETAILED STEP-BY-STEP SOLUTION:
      
      Step 1: [First step with thorough explanation]
      
      Step 2: [Second step with thorough explanation]
      
      Step 3: [Third step with thorough explanation]
      
      [Additional steps as needed]
      
      Final Answer: [The answer with explanation]",
      "difficulty": "${difficulty}",
      "tags": ["${topic.id}", "${difficulty}"]
    }
  `,

    summary: (topic: any) => `
    Create a comprehensive summary for the calculus topic: "${topic.title}"
    Description: ${topic.description}
    
    The summary should be in HTML format with proper LaTeX mathematical notation and include:
    - Key definitions and concepts
    - Important formulas and theorems
    - Common techniques and methods
    - Real-world applications
    - Common mistakes to avoid
    
    Use $ for inline math and $$ for display math. Make it comprehensive but accessible to calculus students.
    Format as clean HTML with proper mathematical expressions.
  `,
  },

  // Question enhancement prompts
  questionEnhancement: {
    improve: (topic: any, question: any) => `
    You are an expert calculus professor improving a practice problem for the topic "${topic.title}".
    
    Current Problem: ${question.problem}
    Current Answer: ${question.answer}
    Current Hint: ${question.hint}
    Current Solution: ${question.solution}
    
    Enhance this problem by:
    1. Making the mathematical notation clearer and more precise using LaTeX
    2. Ensuring the problem tests key concepts effectively
    3. Improving the hint to be more helpful without giving away the answer
    4. Transforming the solution into a detailed step-by-step format where each step is thoroughly explained
    5. Adding real-world context if appropriate
    
    The solution MUST follow this format:
    
    DETAILED STEP-BY-STEP SOLUTION:
    
    Step 1: [First step with thorough explanation]
    
    Step 2: [Second step with thorough explanation]
    
    Step 3: [Third step with thorough explanation]
    
    [Additional steps as needed]
    
    Final Answer: [The answer with explanation]
    
    Return a JSON object with the enhanced version:
    {
      "problem": "Enhanced problem statement with better LaTeX notation",
      "answer": "Correct answer (improved if needed)",
      "hint": "More helpful and educational hint",
      "solution": "Detailed step-by-step solution following the required format",
      "difficulty": "${question.difficulty}",
      "tags": ${JSON.stringify(question.tags || [topic.id])},
      "quality_score": 0.9
    }
  `,

    createDifficult: (topic: any) => `
    You are an expert calculus professor creating a challenging but educational practice problem for the topic "${topic.title}".
    
    Create a difficult problem that:
    1. Tests deep understanding of the concept
    2. Requires multiple steps or techniques to solve
    3. Might combine this concept with related concepts
    4. Uses proper LaTeX notation throughout
    5. Has real-world relevance if possible
    
    The solution MUST follow this format:
    
    DETAILED STEP-BY-STEP SOLUTION:
    
    Step 1: [First step with thorough explanation]
    
    Step 2: [Second step with thorough explanation]
    
    Step 3: [Third step with thorough explanation]
    
    [Additional steps as needed]
    
    Final Answer: [The answer with explanation]
    
    Return a JSON object:
    {
      "problem": "A challenging problem statement with proper LaTeX notation",
      "answer": "The correct answer (numerical or algebraic)",
      "hint": "A helpful hint that guides without giving away too much",
      "solution": "Detailed step-by-step solution following the required format",
      "difficulty": "hard",
      "tags": ["${topic.id}", "challenging", "multi-step"],
      "quality_score": 0.95
    }
  `,
  },

  // Puter AI specific prompts
  puterAI: {
    generateQuestion: (topic: any) => `
    As an expert calculus instructor, create a challenging but educational practice problem for the topic "${topic.title}" (${topic.description}).
    
    Requirements:
    1. The problem should be difficult but solvable with proper understanding
    2. Use proper LaTeX notation (e.g., $\\frac{d}{dx}$, $\\int$, $\\lim_{x \\to a}$)
    3. Include a clear problem statement
    4. Provide the correct answer
    5. Include a detailed step-by-step solution where each step is thoroughly explained
    
    Format your response as a JSON object with these fields:
    - problem: The problem statement
    - answer: The correct answer
    - hint: A helpful hint
    - solution: A detailed step-by-step solution
    - difficulty: "hard"
    
    The solution MUST follow this format:
    
    DETAILED STEP-BY-STEP SOLUTION:
    
    Step 1: [First step with thorough explanation]
    
    Step 2: [Second step with thorough explanation]
    
    Step 3: [Third step with thorough explanation]
    
    [Additional steps as needed]
    
    Final Answer: [The answer with explanation]
  `,
  },

  // Prompts for generating content from arbitrary text (e.g., from EPUB)
  epubContent: {
    summary: (chapterTitle: string, chapterContent: string) => `
    You are an expert calculus professor. Summarize the following text from a calculus textbook chapter titled "${chapterTitle}".
    
    Text to summarize:
    \`\`\`
    ${chapterContent}
    \`\`\`
    
    Provide a comprehensive summary in HTML format with proper LaTeX mathematical notation. Include:
    - Key definitions and concepts
    - Important formulas and theorems
    - Common techniques and methods
    - Real-world applications (if present in the text)
    
    Use $ for inline math and $$ for display math. Make it comprehensive but accessible to calculus students.
    The summary should be at least 300 words.
  `,
    questions: (chapterTitle: string, chapterContent: string) => `
    You are an expert calculus professor. Generate 3-5 high-quality practice problems based on the following text from a calculus textbook chapter titled "${chapterTitle}".
    
    Text for problems:
    \`\`\`
    ${chapterContent}
    \`\`\`
    
    For each problem, return a JSON object with this structure:
    {
      "problem": "Problem statement with proper LaTeX notation",
      "answer": "The correct answer (numerical or algebraic)",
      "hint": "A helpful hint that guides toward the solution method",
      "solution": "DETAILED STEP-BY-STEP SOLUTION:
      
      Step 1: [First step with thorough explanation]
      
      Step 2: [Second step with thorough explanation]
      
      Step 3: [Third step with thorough explanation]
      
      [Additional steps as needed]
      
      Final Answer: [The answer with explanation]",
      "difficulty": "medium" // or "hard" or "easy" based on the problem
    }
    
    Ensure problems:
    - Are mathematically accurate and directly related to the provided text.
    - Use proper LaTeX notation throughout.
    - Have clear, detailed step-by-step solutions.
    - Vary in difficulty if possible.
    - Are distinct from each other.
    
    Return a JSON array of these problem objects.
  `,
  },
}
