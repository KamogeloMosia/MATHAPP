// Centralized file for AI prompts - REFINED for conciseness, accuracy, and memory aids

export const prompts = {
  // Main content generation prompts - ULTRA CONCISE VERSION
  contentGeneration: {
    explanation: (topic: any) => `
You are an expert calculus professor creating ULTRA-CONCISE educational content for "${topic.title}".

Topic: ${topic.description}

Create the SHORTEST possible explanation using this EXACT structure with color coding:

<div class="space-y-4">
  <div class="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-3 rounded-r-lg">
    <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">🔵 Core Concept</h3>
    <p class="text-blue-800 dark:text-blue-200 text-sm">[ONE sentence definition with key formula]</p>
  </div>
  
  <div class="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-3 rounded-r-lg">
    <h4 class="text-md font-semibold text-green-900 dark:text-green-100 mb-1">🟢 Key Formula</h4>
    <div class="text-green-800 dark:text-green-200 text-sm">
      <p class="font-mono bg-green-100 dark:bg-green-900 p-2 rounded">[Main formula in LaTeX]</p>
    </div>
  </div>
  
  <div class="bg-purple-50 dark:bg-purple-950 border-l-4 border-purple-500 p-3 rounded-r-lg">
    <h4 class="text-md font-semibold text-purple-900 dark:text-purple-100 mb-1">🟣 Memory Aid</h4>
    <p class="text-purple-800 dark:text-purple-200 text-sm font-medium">[Create a catchy mnemonic or memory trick]</p>
  </div>
  
  <div class="bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 p-3 rounded-r-lg">
    <h4 class="text-md font-semibold text-orange-900 dark:text-orange-100 mb-1">🟠 Quick Tip</h4>
    <p class="text-orange-800 dark:text-orange-200 text-sm">[ONE practical tip for solving problems]</p>
  </div>
</div>

STRICT REQUIREMENTS:
- Each section: MAX 15 words
- Use proper LaTeX: $ for inline, $$ for display
- Include ONE memorable mnemonic
- Focus on exam-relevant content only
- Total word count: UNDER 60 words

Example mnemonic style: "FOIL for multiplication, LIATE for integration by parts"
`,

    example: (topic: any) => `
Create the SIMPLEST possible worked example for "${topic.title}".

Requirements:
- Use BASIC numbers (1, 2, 3, simple fractions)
- Show the concept in 2-3 steps MAX
- Include the mnemonic/memory aid in the solution
- Use color coding in the explanation

Return JSON:
{
  "problem": "Simple problem with basic numbers and LaTeX",
  "solution": "Step 1: [Brief step with color reference]\nStep 2: [Apply mnemonic]\nAnswer: [Final result]",
  "steps": [
    "🔵 Identify: [what to find]",
    "🟢 Apply: [formula with mnemonic]", 
    "🟠 Solve: [final calculation]"
  ],
  "marks": 2,
  "colorTip": "Remember: Blue=identify, Green=formula, Orange=calculate"
}

Keep it EXTREMELY simple - a beginner should solve this in under 2 minutes.
`,

    summary: (topic: any) => `
Create a MICRO-SUMMARY for "${topic.title}" in under 40 words total.

Use this structure:
<div class="space-y-2">
  <h3 class="text-blue-600">🔵 Definition</h3>
  <p class="text-sm">[8 words max]</p>
  
  <h4 class="text-green-600">🟢 Formula</h4>
  <p class="text-sm font-mono bg-gray-100 p-1 rounded">[LaTeX formula]</p>
  
  <h4 class="text-purple-600">🟣 Memory Trick</h4>
  <p class="text-sm font-medium">[Short mnemonic - 6 words max]</p>
  
  <h4 class="text-orange-600">🟠 Use</h4>
  <p class="text-sm">[When to use - 8 words max]</p>
</div>

TOTAL: Under 40 words. Be ruthlessly concise.
`,
  },

  // Enhanced question prompts with color coding
  questionEnhancement: {
    improve: (topic: any, question: any) => `
Enhance this calculus problem for "${topic.title}" with color-coded solution steps.

Current: ${question.problem}

Return JSON with color-coded solution:
{
  "problem": "Clear problem with LaTeX",
  "answer": "Final answer",
  "hint": "Helpful hint with mnemonic reference",
  "solution": "🔵 IDENTIFY: [what we need]\n🟢 FORMULA: [which formula + mnemonic]\n🟠 CALCULATE: [step by step]\n🔴 CHECK: [verify answer]",
  "difficulty": "${question.difficulty}",
  "colorGuide": "Blue=Identify, Green=Formula, Orange=Calculate, Red=Check"
}

Make the solution follow the color system consistently.
`,
  },

  // EPUB content processing
  epubContent: {
    summary: (chapterTitle: string, chapterContent: string) => `
Summarize "${chapterTitle}" in ULTRA-CONCISE format with color coding.

Text: ${chapterContent.substring(0, 1000)}...

Create summary under 100 words using:
- 🔵 Blue for definitions
- 🟢 Green for formulas  
- 🟣 Purple for memory aids
- 🟠 Orange for applications

Include 2-3 mnemonics for key concepts.
Use proper LaTeX notation.
Focus on exam-essential content only.
`,

    questions: (chapterTitle: string, chapterContent: string) => `
Generate 3 SIMPLE practice problems from "${chapterTitle}".

Text: ${chapterContent.substring(0, 800)}...

For each problem, return JSON:
{
  "problem": "Simple problem with basic numbers",
  "answer": "Clear numerical answer", 
  "hint": "Hint with mnemonic reference",
  "solution": "🔵 IDENTIFY: [step]\n🟢 FORMULA: [step]\n🟠 CALCULATE: [step]",
  "difficulty": "easy",
  "mnemonic": "Memory aid for this concept"
}

Keep problems VERY simple - solvable in 2-3 steps.
`,
  },

  // Easy practice with mnemonics
  easyPracticeExample: (topic: any) => `
Create a SUPER EASY problem for "${topic.title}" with memory aids.

Requirements:
- Use numbers 1-10 only
- Include a mnemonic in the hint
- Color-code the solution steps
- Solvable in under 2 minutes

Return JSON:
{
  "problem": "Very simple problem",
  "answer": "Simple answer",
  "hint": "Helpful hint with mnemonic: [memory device]",
  "solution": "🔵 IDENTIFY: [what we need]\n🟢 REMEMBER: [mnemonic]\n🟠 CALCULATE: [simple math]\n✅ ANSWER: [result]",
  "difficulty": "easy",
  "mark": 2,
  "mnemonic": "Short memory trick for this concept"
}
`,

  // Exam questions with color coding
  examQuestion: (topic: any, questionType: "Multiple Choice" | "Full Solution" | "auto" = "auto") => `
Generate an exam-style question for "${topic.title}" with color-coded solution.

Requirements:
- Match ASMA1B1/MAT01B1 style
- Include mnemonic in solution
- Use color coding system
- 2-4 marks appropriate

Format:
[Topic: ${topic.title}]
[Type: ${questionType === "auto" ? "Multiple Choice OR Full Solution" : questionType}]
[Question: Clear exam-style question]
[Marks: X marks]
[Solution: Color-coded steps using 🔵🟢🟠🔴 system]
[Mnemonic: Memory aid for this concept]
[Hint: Brief hint with memory trick]

Color system:
🔵 IDENTIFY - what we need to find
🟢 FORMULA - which formula/rule to use  
🟠 CALCULATE - step-by-step math
🔴 CHECK - verify the answer

Keep solution concise but complete.
`,

  // NEW: Random reminder questions
  reminderQuestion: (topics: string[]) => `
Generate a quick REMINDER question from these calculus topics: ${topics.join(", ")}.

This is for a popup reminder to keep students engaged.

Requirements:
- VERY quick to answer (30 seconds max)
- Include a helpful mnemonic
- Use encouraging tone
- Basic difficulty level

Return JSON:
{
  "question": "Quick question with LaTeX",
  "answer": "Simple answer",
  "explanation": "Brief explanation with mnemonic",
  "topic": "Which topic this covers",
  "timeEstimate": "30 seconds",
  "encouragement": "Motivational message after answering",
  "mnemonic": "Memory trick for this concept"
}

Make it feel like a friendly quiz, not a test!
`,
}
