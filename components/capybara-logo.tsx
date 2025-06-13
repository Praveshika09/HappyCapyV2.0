"use client"

import { useState } from "react"

interface CapybaraLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  className?: string
}

export default function CapybaraLogo({ size = "md", animated = true, className = "" }: CapybaraLogoProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 80, height: 80 },
    xl: { width: 120, height: 120 },
  }

  const { width, height } = sizeMap[size]

  return (
    <div
      className={`inline-block cursor-pointer transition-all duration-300 ${
        animated ? "animate-bounce" : "" // Relying on Tailwind's animate-bounce
      } ${isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={width} height={height} viewBox="0 0 120 120" className="drop-shadow-lg">
        {/* Capybara body */}
        <ellipse cx="60" cy="75" rx="35" ry="25" fill="#D4A574" stroke="#B8956A" strokeWidth="2" />

        {/* Capybara head */}
        <ellipse cx="60" cy="45" rx="28" ry="22" fill="#E6C18A" stroke="#B8956A" strokeWidth="2" />

        {/* Ears */}
        <ellipse cx="45" cy="30" rx="8" ry="12" fill="#D4A574" stroke="#B8956A" strokeWidth="1.5" />
        <ellipse cx="75" cy="30" rx="8" ry="12" fill="#D4A574" stroke="#B8956A" strokeWidth="1.5" />

        {/* Inner ears */}
        <ellipse cx="45" cy="32" rx="4" ry="6" fill="#F4D4A7" />
        <ellipse cx="75" cy="32" rx="4" ry="6" fill="#F4D4A7" />

        {/* Eyes */}
        <circle cx="52" cy="42" r="4" fill="#2D3748" />
        <circle cx="68" cy="42" r="4" fill="#2D3748" />

        {/* Eye highlights */}
        <circle cx="53" cy="41" r="1.5" fill="white" />
        <circle cx="69" cy="41" r="1.5" fill="white" />

        {/* Nose */}
        <ellipse cx="60" cy="50" rx="3" ry="2" fill="#8B4513" />

        {/* Mouth */}
        <path d="M55 55 Q60 58 65 55" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Legs */}
        <ellipse cx="40" cy="95" rx="6" ry="10" fill="#D4A574" stroke="#B8956A" strokeWidth="1.5" />
        <ellipse cx="55" cy="98" rx="6" ry="8" fill="#D4A574" stroke="#B8956A" strokeWidth="1.5" />
        <ellipse cx="65" cy="98" rx="6" ry="8" fill="#D4A574" stroke="#B8956A" strokeWidth="1.5" />
        <ellipse cx="80" cy="95" rx="6" ry="10" fill="#D4A574" stroke="#B8956A" strokeWidth="1.5" />

        {/* Cute blush */}
        <circle cx="38" cy="48" r="3" fill="#F8BBD9" opacity="0.6" />
        <circle cx="82" cy="48" r="3" fill="#F8BBD9" opacity="0.6" />

        {/* Happy expression lines */}
        <path d="M48 38 Q52 35 56 38" stroke="#8B4513" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M64 38 Q68 35 72 38" stroke="#8B4513" strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}
