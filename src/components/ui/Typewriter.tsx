import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

interface TypewriterProps {
  texts: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
}

export function Typewriter({
  texts,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseDuration = 2000,
}: TypewriterProps) {
  const reduceMotion = useReducedMotion()
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Reduced motion: no typing loop at all — the first role is rendered whole below.
  useEffect(() => {
    if (reduceMotion) return
    const text = texts[currentTextIndex]
    let timeout: number

    if (!isDeleting && currentText === text) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration)
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false)
      setCurrentTextIndex((prev) => (prev + 1) % texts.length)
    } else {
      timeout = setTimeout(
        () => {
          if (isDeleting) {
            setCurrentText(text.substring(0, currentText.length - 1))
          } else {
            setCurrentText(text.substring(0, currentText.length + 1))
          }
        },
        isDeleting ? deleteSpeed : typeSpeed,
      )
    }

    return () => clearTimeout(timeout)
  }, [reduceMotion, currentText, currentTextIndex, isDeleting, texts, typeSpeed, deleteSpeed, pauseDuration])

  return (
    <>
      {/* Assistive tech gets the whole role list once; the typed prefix is decoration. */}
      <span className="sr-only">{texts.join(', ')}</span>
      <span aria-hidden="true">
        {reduceMotion ? texts[0] : currentText}
        <span className="typewriter-cursor" />
      </span>
    </>
  )
}
