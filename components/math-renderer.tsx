"use client"

import { useEffect, useState, useRef } from "react"
import { RefreshCw } from "lucide-react" // Import RefreshCw for the spinner

interface MathRendererProps {
  content: string
  className?: string
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    try {
      // Load MathJax configuration and library
      if (typeof window !== "undefined" && !(window as any).MathJax) {
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
              try {
                ;(window as any).MathJax.startup.defaultReady()
                setIsLoaded(true)
                setError(false)
              } catch (startupError) {
                console.error("MathJax startup error:", startupError)
                setError(true)
                setIsLoaded(true) // Still set loaded to show fallback content
              }
            },
          },
        }

        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        script.async = true
        script.onerror = () => {
          console.error("Failed to load MathJax")
          setError(true)
          setIsLoaded(true)
        }

        // Set timeout for MathJax loading
        timeoutId = setTimeout(() => {
          console.warn("MathJax loading timeout")
          setError(true)
          setIsLoaded(true)
        }, 10000)

        document.head.appendChild(script)
      } else if (typeof window !== "undefined" && (window as any).MathJax) {
        setIsLoaded(true)
      }
    } catch (loadError) {
      console.error("Error setting up MathJax:", loadError)
      setError(true)
      setIsLoaded(true)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && containerRef.current && !error) {
      try {
        // Format step-by-step solutions for better readability
        let formattedContent = content || ""

        // Format step-by-step solutions
        if (formattedContent.includes("DETAILED STEP-BY-STEP SOLUTION")) {
          formattedContent = formattedContent
            .replace(
              /DETAILED STEP-BY-STEP SOLUTION:?/g,
              '<div class="font-bold text-lg mb-4">DETAILED STEP-BY-STEP SOLUTION:</div>',
            )
            .replace(/Step (\d+):/g, '<div class="font-semibold text-blue-700 mt-4 mb-2">Step $1:</div>')
            .replace(
              /Final Answer:\s*([\s\S]*)/i,
              '<div class="font-semibold text-green-700 mt-4 mb-2">Final Answer:</div><p>$1</p>',
            ) // Ensure final answer is also rendered as a paragraph
        }

        // Set content and then typeset
        containerRef.current.innerHTML = formattedContent

        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
          ;(window as any).MathJax.typesetPromise([containerRef.current])
            .then(() => {
              // MathJax rendering complete
            })
            .catch((err: any) => {
              console.error("MathJax rendering error:", err)
              // Don't set error state here, just log it
            })
        }
      } catch (renderError) {
        console.error("Error rendering math content:", renderError)
        // Fallback to plain text
        if (containerRef.current) {
          containerRef.current.innerHTML = content || ""
        }
      }
    } else if (isLoaded && error && containerRef.current) {
      // Fallback rendering without MathJax
      containerRef.current.innerHTML = content || ""
    }
  }, [content, isLoaded, error])

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-12 bg-gray-100 text-gray-500 rounded ${className}`}>
        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
        <span>Loading Math...</span>
      </div>
    )
  }

  if (error) {
    // Fallback rendering without MathJax
    return (
      <div className={`math-content leading-relaxed ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: content || "" }} />
        {content && content.includes("$") && (
          <div className="text-xs text-gray-500 mt-2">
            Note: Mathematical notation may not display correctly due to a loading issue.
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`math-content leading-relaxed ${className}`} suppressHydrationWarning={true} />
  )
}
