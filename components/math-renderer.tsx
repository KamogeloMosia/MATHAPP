"use client"

import { useEffect, useState } from "react"

interface MathRendererProps {
  content: string
  className?: string
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [renderedContent, setRenderedContent] = useState("")

  useEffect(() => {
    // Load MathJax configuration and library
    if (typeof window !== "undefined" && !(window as any).MathJax) {
      // Configure MathJax before loading
      ;(window as any).MathJax = {
        tex: {
          inlineMath: [
            ["$", "$"],
            ["$$", "$$"],
          ],
          displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
          ],
          processEscapes: true,
          processEnvironments: true,
        },
        options: {
          skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
          ignoreHtmlClass: "tex2jax_ignore",
          processHtmlClass: "tex2jax_process",
        },
        startup: {
          ready: () => {
            ;(window as any).MathJax.startup.defaultReady()
            setIsLoaded(true)
          },
        },
      }

      // Load MathJax script
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
      script.async = true
      document.head.appendChild(script)
    } else if (typeof window !== "undefined") {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && content) {
      // Format step-by-step solutions for better readability
      let formattedContent = content

      // Format step-by-step solutions
      if (content.includes("DETAILED STEP-BY-STEP SOLUTION")) {
        formattedContent = content
          .replace(
            /DETAILED STEP-BY-STEP SOLUTION:?/g,
            '<div class="font-bold text-lg mb-4">DETAILED STEP-BY-STEP SOLUTION:</div>',
          )
          .replace(/Step (\d+):/g, '<div class="font-semibold text-blue-700 mt-4 mb-2">Step $1:</div>')
          .replace(/Final Answer:/g, '<div class="font-semibold text-green-700 mt-4 mb-2">Final Answer:</div>')
      }

      setRenderedContent(formattedContent)

      // Use a timeout to ensure DOM is updated before MathJax processes
      setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).MathJax && (window as any).MathJax.typesetPromise) {
          ;(window as any).MathJax.typesetPromise()
            .then(() => {
              // MathJax rendering complete
            })
            .catch((err: any) => console.error("MathJax rendering error:", err))
        }
      }, 100)
    }
  }, [content, isLoaded])

  if (!isLoaded) {
    return <div className={`animate-pulse bg-gray-200 h-6 rounded ${className}`}></div>
  }

  return (
    <div
      className={`math-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  )
}
