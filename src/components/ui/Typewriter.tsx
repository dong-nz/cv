import { useEffect, useState } from "react"

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
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")

  const [isDeleting, setIsDeleting] = useState(false)
  useEffect(() => {
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
  }, [currentText, currentTextIndex, isDeleting, texts, typeSpeed, deleteSpeed, pauseDuration])

  return (
    <span>
      {currentText}
      <span className="typewriter-cursor" />
    </span>
  )
}
