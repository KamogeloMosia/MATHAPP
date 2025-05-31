// Centralized file for AI prompts to ensure consistency and quality

export const prompts = {
  // Main content generation prompts
  contentGeneration: {
    explanation: (topic: any) => `
You are an expert calculus professor creating FOCUSED exam-prep content for "${topic.title}".

Topic: ${topic.description}

Create a STRAIGHT-TO-THE-POINT explanation using this EXACT structure:

<div class="space-y-4">
  <div class="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 rounded-r-lg">
    <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 What You Must Know</h3>
    <p class="text-blue-800 dark:text-blue-200 font-medium">[ONE clear sentence defining the concept]</p>
  </div>
  
  <div class="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-4 rounded-r-lg">
    <h4 class="text-md font-semibold text-green-900 dark:text-green-100 mb-2">📐 Key Formula(s)</h4>
    <div class="text-green-800 dark:text-green-200">
      <div class="font-mono bg-green-100 dark:bg-green-900 p-3 rounded text-center">
        [Main formula in LaTeX - the ONE you MUST memorize]
      </div>
      <p class="text-sm mt-2 font-medium">[When to use this formula - ONE sentence]</p>
    </div>
  </div>
  
  <div class="bg-purple-50 dark:bg-purple-950 border-l-4 border-purple-500 p-4 rounded-r-lg">
    <h4 class="text-md font-semibold text-purple-900 dark:text-purple-100 mb-2">⚡ Quick Method</h4>
    <ol class="text-purple-800 dark:text-purple-200 text-sm space-y-1">
      <li><strong>1.</strong> [First step - what to identify]</li>
      <li><strong>2.</strong> [Second step - what formula to apply]</li>
      <li><strong>3.</strong> [Third step - how to solve]</li>
    </ol>
  </div>
  
  <div class="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded-r-lg">
    <h4 class="text-md font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Common Mistake</h4>
    <p class="text-red-800 dark:text-red-200 text-sm font-medium">[ONE common error students make + how to avoid it]</p>
  </div>
</div>

STRICT REQUIREMENTS:
- Definition: MAX 20 words
- Formula: Include the MOST IMPORTANT formula only
- Method: Exactly 3 steps, each under 8 words
- Common mistake: ONE specific error + fix
- Use proper LaTeX: $ for inline, $$ for display
- Focus ONLY on exam-essential content
- Total word count: UNDER 100 words

Make it feel like exam notes - what a student would write on a formula sheet.
`,

    example: (topic: any) => `
Create a SIMPLE worked example for the calculus topic "${topic.title}" that helps students understand the basic concept.

The example should:
- Be EASY and straightforward (not challenging)
- Use simple numbers and basic functions
- Focus on demonstrating the core concept clearly
- Use proper LaTeX notation
- Have clear, step-by-step solution
- Be suitable for someone just learning this topic

Return a JSON object with this structure:
{
  "problem": "A simple, easy example problem with basic LaTeX notation",
  "solution": "Clear solution showing the main steps",
  "steps": [
    "Step 1: [Simple first step]",
    "Step 2: [Simple second step]", 
    "Step 3: [Final step with answer]"
  ],
  "marks": 3
}
`,

    summary: (topic: any) => `
Create EXAM-FOCUSED notes for "${topic.title}" in under 50 words total.

Format as concise bullet points:
<div class="space-y-2 text-sm">
  <div class="font-semibold text-blue-600">🎯 Core Concept:</div>
  <p>[Definition in 8 words max]</p>
  
  <div class="font-semibold text-green-600">📐 Must-Know Formula:</div>
  <div class="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-center">
    [Key formula in LaTeX]
  </div>
  
  <div class="font-semibold text-purple-600">⚡ Quick Steps:</div>
  <p>[3-step method in 15 words max]</p>
  
  <div class="font-semibold text-red-600">⚠️ Watch Out:</div>
  <p>[Common mistake in 8 words max]</p>
</div>

TOTAL: Under 50 words. Be ruthlessly concise - exam cheat sheet style.
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

  // Easy practice examples for learning
  easyPracticeExample: (topic: any) => `
Create a VERY EASY practice problem for students just learning "${topic.title}".

Requirements:
- Use simple numbers (like 1, 2, 3, not fractions or decimals)
- Focus on basic application of the concept
- Should be solvable in 2-3 steps maximum
- Use straightforward functions (polynomials, simple trig)
- Include a helpful hint
- Provide clear step-by-step solution

Return a JSON object:
{
  "problem": "Very simple problem with basic LaTeX notation",
  "answer": "Simple numerical answer",
  "hint": "Helpful hint that guides the student",
  "solution": "STEP-BY-STEP SOLUTION:
  
  Step 1: [Simple first step]
  
  Step 2: [Simple second step]
  
  Final Answer: [Clear answer]",
  "difficulty": "easy",
  "mark": 2
}
`,

  // UNIVERSAL AI PROMPT for exam-level questions (unchanged but used for chapter problems)
  examQuestion: (topic: any, questionType: "Multiple Choice" | "Full Solution" | "auto" = "auto") => `
You are a question-generating assistant for a university-level calculus exam app. The user is studying for exams based on the ASMA1B1 and MAT01B1 past papers. 

Your task is to generate **realistic, exam-style questions** that match the difficulty and format of those papers. Each question must be relevant to the user's current practice topic. You will generate:

1. A clear, exam-appropriate **question** (MCQ or full-solution format)
2. A [mark allocation] (1–4 marks for MCQs, 3–6 marks for structured)
3. A **correct answer**, with steps if applicable
4. A **helpful hint**
5. Clearly labeled **multiple-choice options (if MCQ)**

---

📚 When generating a question, follow these rules:

- Follow **James Stewart's Calculus: Early Transcendentals** style and notation.
- Avoid trivia. Focus on problem-solving, setup, and interpretation.
- Do not repeat past paper questions directly, but match their logic and structure.

---

🔧 Required Output Format:
[Topic: ${topic.title}]
[Question Type: ${questionType === "auto" ? "Multiple Choice OR Full Solution" : questionType}]
[Question: Full question in clean, academic style]
[Mark: X marks]
[Answer: Final answer only OR step-by-step solution with LaTeX]
[Hint: A helpful hint with LaTeX]
[If MCQ: Options (a) to (e), and mark correct one clearly, e.g., (a) 5 (b) 6 (c) 7 (d) 8 (e) 9 (Correct: b)]

---

💡 Choose question topics based on the user's current section. Here are examples per topic:

- **Critical Points & Extrema** → Use polynomial functions. Ask to find and classify points.
- **Optimization** → Create real-world minimization/maximization problems.
- **Area Between Curves** → Provide two intersecting functions and a range.
- **Volumes (Disk/Shell)** → Ask to set up or solve volume integrals for solids of revolution.
- **Arc Length** → Ask to set up the arc length of functions on a closed interval.
- **Surface Area** → Ask to set up surface area around the x- or y-axis.
- **Differential Equations** → Focus on separable and linear first-order DEs.
- **Average Value** → Use standard function over a defined interval.
- **Mean/Rolle's Theorem** → Provide a function and ask to verify or find c.
- **Parametric Curves** → Ask to find dy/dx or arc length using x(t), y(t).
- **Polar Curves** → Ask to convert to Cartesian or compute area.
- **Matrix Algebra** → Ask for Gaussian Elimination, Augmented Matrix, or Solution Set.
- **Binomial Expansions** → Ask for specific term or coefficient in an expansion.

---

🔥 Always adjust difficulty and format to match past papers. The output should look like it belongs in a real exam.
`,
}
