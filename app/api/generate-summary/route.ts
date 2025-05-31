import { generateText } from "ai"
import { google } from "@ai-sdk/google" // Import Google AI SDK

export async function POST(request: Request) {
  try {
    const { topicId, level } = await request.json()

    // Update the generateText call to use more comprehensive prompts for topic summaries

    const topicPrompts = {
      // Chapter 1: Functions and Models
      "four-ways-represent-function": `Create a comprehensive summary about the four ways to represent functions: verbal, numerical, visual, and algebraic. Include examples of each representation and explain how to convert between them. Use LaTeX for mathematical expressions.`,

      "mathematical-models": `Create a detailed summary of mathematical models including linear, polynomial, power, rational, algebraic, and transcendental functions. Explain when each type is used and provide real-world examples. Use LaTeX formatting.`,

      "new-functions-old": `Summarize transformations of functions including shifts, stretches, reflections, and combinations. Include function composition and how to build new functions from existing ones. Use LaTeX notation.`,

      "exponential-functions": `Create a comprehensive summary of exponential functions, their properties, graphs, and applications. Include natural exponential function and growth/decay models. Use LaTeX formatting.`,

      "inverse-functions-logarithms": `Summarize inverse functions and logarithms, including properties of logarithms, solving exponential and logarithmic equations, and applications. Use LaTeX notation.`,

      // Chapter 2: Limits and Derivatives
      "tangent-velocity-problems": `Explain the tangent and velocity problems that motivate the concept of derivatives. Include geometric and physical interpretations. Use LaTeX for mathematical expressions.`,

      "limit-function": `Create a detailed summary of limits including definition, notation, one-sided limits, and limit laws. Include examples of evaluating limits. Use LaTeX formatting.`,

      "calculating-limits": `Summarize techniques for calculating limits including direct substitution, factoring, rationalization, and squeeze theorem. Provide examples with LaTeX notation.`,

      continuity: `Explain continuity of functions including definition, types of discontinuities, and the Intermediate Value Theorem. Use LaTeX for mathematical expressions.`,

      "limits-infinity": `Summarize limits at infinity and horizontal asymptotes. Include techniques for evaluating infinite limits and limits at infinity. Use LaTeX formatting.`,

      "derivatives-rates-change": `Create a comprehensive summary of derivatives as rates of change, including definition, geometric interpretation, and applications. Use LaTeX notation.`,

      "derivative-function": `Explain the derivative as a function, including notation, relationship to continuity, and higher-order derivatives. Use LaTeX formatting.`,

      // Chapter 3: Differentiation Rules
      "derivatives-polynomials": `Summarize differentiation of polynomials and exponential functions including power rule and basic derivative formulas. Use LaTeX notation.`,

      "product-quotient-rules": `Create a detailed summary of product and quotient rules for differentiation with examples and applications. Use LaTeX formatting.`,

      "derivatives-trigonometric": `Explain derivatives of trigonometric functions including all six trig functions and their derivatives. Use LaTeX notation.`,

      "chain-rule": `Create a comprehensive summary of the chain rule including statement, applications, and examples with composite functions. Use LaTeX formatting.`,

      "implicit-differentiation": `Summarize implicit differentiation technique including when to use it and step-by-step examples. Use LaTeX notation.`,

      "derivatives-logarithmic": `Explain differentiation of logarithmic functions including natural log and logarithmic differentiation. Use LaTeX formatting.`,

      "rates-change-sciences": `Summarize applications of derivatives in natural and social sciences including physics, biology, and economics examples. Use LaTeX notation.`,

      "exponential-growth-decay": `Create a summary of exponential growth and decay models including differential equations and applications. Use LaTeX formatting.`,

      "related-rates": `Explain related rates problems including general approach, common setups, and solution strategies. Use LaTeX notation.`,

      "linear-approximations": `Summarize linear approximations and differentials including tangent line approximations and error estimation. Use LaTeX formatting.`,

      // Chapter 4: Applications of Differentiation
      "maximum-minimum-values": `Create a comprehensive summary of finding maximum and minimum values including critical points, extreme value theorem, and optimization. Use LaTeX notation.`,

      "mean-value-theorem": `Explain the Mean Value Theorem including statement, geometric interpretation, and applications. Use LaTeX formatting.`,

      "derivatives-shape-graph": `Summarize how derivatives affect graph shape including increasing/decreasing functions, concavity, and inflection points. Use LaTeX notation.`,

      "indeterminate-forms": `Create a detailed summary of indeterminate forms and L'Hôpital's Rule including types of indeterminate forms and solution techniques. Use LaTeX formatting.`,

      "summary-curve-sketching": `Explain comprehensive curve sketching including all steps from domain analysis to final graph. Use LaTeX notation.`,

      "optimization-problems": `Summarize optimization problems including general approach, constraint handling, and real-world applications. Use LaTeX notation.`,

      "newtons-method": `Create a summary of Newton's Method for finding roots including algorithm, convergence, and applications. Use LaTeX notation.`,

      antiderivatives: `Explain antiderivatives including definition, basic antiderivative formulas, and relationship to derivatives. Use LaTeX formatting.`,

      // Chapter 5: Integrals
      "areas-distances": `Summarize the introduction to integration through area and distance problems including Riemann sums and definite integrals. Use LaTeX notation.`,

      "definite-integral": `Create a comprehensive summary of definite integrals including definition, properties, and geometric interpretation. Use LaTeX formatting.`,

      "fundamental-theorem": `Explain the Fundamental Theorem of Calculus including both parts and their significance. Use LaTeX notation.`,

      "indefinite-integrals": `Summarize indefinite integrals and the Net Change Theorem including basic integration formulas. Use LaTeX formatting.`,

      "substitution-rule": `Create a detailed summary of the substitution rule for integration including technique and examples. Use LaTeX notation.`,

      // Chapter 6: Applications of Integration
      "areas-between-curves": `Explain finding areas between curves including setup, integration, and examples with multiple curves. Use LaTeX formatting.`,

      volumes: `Summarize volume calculations using cross-sections, disk method, and washer method. Use LaTeX notation.`,

      "volumes-cylindrical-shells": `Create a summary of the shell method for finding volumes including setup and applications. Use LaTeX formatting.`,

      work: `Explain applications of integration to work problems including variable force and pumping problems. Use LaTeX notation.`,

      "average-value-function": `Summarize average value of functions using integration including formula and applications. Use LaTeX formatting.`,

      // Default for any other topics
      default: `Create a comprehensive summary of ${topicId} for calculus students at level ${level}.
        Include key concepts, formulas, and examples. Use LaTeX formatting for mathematical expressions.
        Format as HTML with proper mathematical notation. Include:
        - Definition and key concepts
        - Important formulas and theorems
        - 2-3 worked examples with LaTeX
        - Common applications or techniques
        
        Use $ for inline math and $$ for display math. Make it educational and clear.`,
    }

    const prompt = topicPrompts[topicId as keyof typeof topicPrompts] || topicPrompts.default

    // Use Gemini for summary generation
    const { text } = await generateText({
      model: google("gemini-pro"), // Using Gemini for summary generation
      prompt: prompt + "\n\nFormat the response as clean HTML with LaTeX math expressions using $ and $$ delimiters.",
      temperature: 0.3,
    })

    return Response.json({ summary: text })
  } catch (error) {
    console.error("Error generating summary:", error)
    // Return fallback summary on error
    const { topicId } = await request.json()
    const summary = getFallbackSummary(topicId as string)
    return Response.json({ summary })
  }
}

function getFallbackSummary(topicId: string) {
  const fallbackSummaries = {
    limits: `
      <h3>Limits and Continuity</h3>
      <p><strong>Limits</strong> are fundamental to calculus and describe the behavior of a function as the input approaches a particular value. The limit of $f(x)$ as $x$ approaches $a$ is written as:</p>
      
      $$\\lim_{x \\to a} f(x) = L$$
      
      <p>This means that $f(x)$ gets arbitrarily close to $L$ as $x$ gets arbitrarily close to $a$.</p>
      
      <h4>Key Properties:</h4>
      <ul>
        <li><strong>Sum Rule:</strong> $\\lim_{x \\to a} [f(x) + g(x)] = \\lim_{x \\to a} f(x) + \\lim_{x \\to a} g(x)$</li>
        <li><strong>Product Rule:</strong> $\\lim_{x \\to a} [f(x) \\cdot g(x)] = \\lim_{x \\to a} f(x) \\cdot \\lim_{x \\to a} g(x)$</li>
        <li><strong>Quotient Rule:</strong> $\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{\\lim_{x \\to a} f(x)}{\\lim_{x \\to a} g(x)}$ (if denominator ≠ 0)</li>
      </ul>
      
      <h4>Common Techniques:</h4>
      <ul>
        <li><strong>Direct Substitution:</strong> If $f$ is continuous at $a$, then $\\lim_{x \\to a} f(x) = f(a)$</li>
        <li><strong>Factoring:</strong> Factor and cancel common terms (useful for $\\frac{0}{0}$ forms)</li>
        <li><strong>Rationalization:</strong> Multiply by conjugate to eliminate radicals</li>
        <li><strong>Standard Limits:</strong> $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$</li>
      </ul>
      
      <h4>Continuity:</h4>
      <p>A function $f$ is continuous at $x = a$ if:</p>
      <ol>
        <li>$f(a)$ is defined</li>
        <li>$\\lim_{x \\to a} f(x)$ exists</li>
        <li>$\\lim_{x \\to a} f(x) = f(a)$</li>
      </ol>
    `,
    derivatives: `
      <h3>Derivatives</h3>
      <p><strong>Derivatives</strong> measure the instantaneous rate of change of a function. The derivative of $f(x)$ is defined as:</p>
      
      $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
      
      <h4>Essential Rules:</h4>
      <ul>
        <li><strong>Power Rule:</strong> $(x^n)' = nx^{n-1}$</li>
        <li><strong>Constant Rule:</strong> $(c)' = 0$ where $c$ is a constant</li>
        <li><strong>Sum Rule:</strong> $(f + g)' = f' + g'$</li>
        <li><strong>Product Rule:</strong> $(fg)' = f'g + fg'$</li>
        <li><strong>Quotient Rule:</strong> $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$</li>
        <li><strong>Chain Rule:</strong> $(f(g(x)))' = f'(g(x)) \\cdot g'(x)$</li>
      </ul>
      
      <h4>Common Derivatives:</h4>
      <ul>
        <li>$(\\sin x)' = \\cos x$</li>
        <li>$(\\cos x)' = -\\sin x$</li>
        <li>$(e^x)' = e^x$</li>
        <li>$(\\ln x)' = \\frac{1}{x}$</li>
        <li>$(\\tan x)' = \\sec^2 x$</li>
      </ul>
      
      <h4>Geometric Interpretation:</h4>
      <p>The derivative $f'(a)$ represents the slope of the tangent line to the curve $y = f(x)$ at the point $(a, f(a))$.</p>
    `,
    "derivative-applications": `
      <h3>Applications of Derivatives</h3>
      <p>Derivatives have many practical applications in solving real-world problems.</p>
      
      <h4>Optimization:</h4>
      <p>To find maximum or minimum values:</p>
      <ol>
        <li>Find critical points where $f'(x) = 0$ or $f'(x)$ is undefined</li>
        <li>Use the second derivative test: 
          <ul>
            <li>If $f''(c) > 0$, then $f$ has a local minimum at $x = c$</li>
            <li>If $f''(c) < 0$, then $f$ has a local maximum at $x = c$</li>
          </ul>
        </li>
        <li>Check endpoints of the domain for absolute extrema</li>
      </ol>
      
      <h4>Related Rates:</h4>
      <p>When quantities change with respect to time, use the chain rule:</p>
      $$\\frac{dy}{dt} = \\frac{dy}{dx} \\cdot \\frac{dx}{dt}$$
      
      <p><strong>Steps for Related Rates Problems:</strong></p>
      <ol>
        <li>Identify all variables and their rates of change</li>
        <li>Write an equation relating the variables</li>
        <li>Differentiate both sides with respect to time</li>
        <li>Substitute known values and solve</li>
      </ol>
      
      <h4>Curve Sketching:</h4>
      <ul>
        <li><strong>Critical Points:</strong> Find where $f'(x) = 0$</li>
        <li><strong>Intervals of Increase/Decrease:</strong> Test signs of $f'(x)$</li>
        <li><strong>Inflection Points:</strong> Find where $f''(x) = 0$</li>
        <li><strong>Concavity:</strong> Test signs of $f''(x)$</li>
      </ul>
    `,
    integrals: `
      <h3>Integrals</h3>
      <p><strong>Integration</strong> is the reverse process of differentiation. The indefinite integral represents the family of antiderivatives:</p>
      
      $$\\int f(x) \\, dx = F(x) + C$$
      
      <p>where $F'(x) = f(x)$ and $C$ is the constant of integration.</p>
      
      <h4>Basic Integration Rules:</h4>
      <ul>
        <li><strong>Power Rule:</strong> $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$ (for $n \\neq -1$)</li>
        <li><strong>Constant Rule:</strong> $\\int k \\, dx = kx + C$</li>
        <li><strong>Sum Rule:</strong> $\\int [f(x) + g(x)] \\, dx = \\int f(x) \\, dx + \\int g(x) \\, dx$</li>
        <li><strong>Constant Multiple:</strong> $\\int kf(x) \\, dx = k\\int f(x) \\, dx$</li>
      </ul>
      
      <h4>Common Integrals:</h4>
      <ul>
        <li>$\\int \\sin x \\, dx = -\\cos x + C$</li>
        <li>$\\int \\cos x \\, dx = \\sin x + C$</li>
        <li>$\\int e^x \\, dx = e^x + C$</li>
        <li>$\\int \\frac{1}{x} \\, dx = \\ln|x| + C$</li>
      </ul>
      
      <h4>Fundamental Theorem of Calculus:</h4>
      <p>If $F$ is an antiderivative of $f$ on $[a,b]$, then:</p>
      $$\\int_a^b f(x) \\, dx = F(b) - F(a)$$
      
      <p>This connects differentiation and integration, showing they are inverse operations.</p>
    `,
    "integral-applications": `
      <h3>Applications of Integrals</h3>
      <p>Integrals have many geometric and physical applications.</p>
      
      <h4>Area Under Curves:</h4>
      <p>The definite integral gives the area between a curve and the x-axis:</p>
      $$\\text{Area} = \\int_a^b f(x) \\, dx$$
      
      <p><strong>Note:</strong> If $f(x) < 0$ on some interval, the integral gives the negative of the area. For total area, use $\\int_a^b |f(x)| \\, dx$.</p>
      
      <h4>Area Between Curves:</h4>
      <p>For curves $f(x)$ and $g(x)$ where $f(x) \\geq g(x)$ on $[a,b]$:</p>
      $$\\text{Area} = \\int_a^b [f(x) - g(x)] \\, dx$$
      
      <h4>Volume of Revolution:</h4>
      <p><strong>Disk Method</strong> (around x-axis):</p>
      $$V = \\pi \\int_a^b [f(x)]^2 \\, dx$$
      
      <p><strong>Washer Method</strong> (between two curves):</p>
      $$V = \\pi \\int_a^b [R(x)]^2 - [r(x)]^2 \\, dx$$
      
      <h4>Other Applications:</h4>
      <ul>
        <li><strong>Arc Length:</strong> $L = \\int_a^b \\sqrt{1 + [f'(x)]^2} \\, dx$</li>
        <li><strong>Average Value:</strong> $f_{avg} = \\frac{1}{b-a} \\int_a^b f(x) \\, dx$</li>
        <li><strong>Work:</strong> $W = \\int_a^b F(x) \\, dx$ where $F(x)$ is force</li>
      </ul>
    `,
  }

  return fallbackSummaries[topicId as keyof typeof fallbackSummaries] || fallbackSummaries.limits
}
