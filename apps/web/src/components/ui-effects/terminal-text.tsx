"use client";

import { useState, useEffect } from "react";

type TerminalTextProps = {
  text: string;
  typingSpeed?: number;
  className?: string;
  onComplete?: () => void;
};

export default function TerminalText({
  text,
  typingSpeed = 50,
  className = "",
  onComplete,
}: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, typingSpeed, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`font-mono ${className}`}>
      {displayedText}
      {cursor && currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-white ml-1"></span>
      )}
    </div>
  );
}
