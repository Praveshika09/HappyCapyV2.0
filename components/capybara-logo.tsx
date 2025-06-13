"use client"

import { useState } from "react"
import Image from "next/image"

interface CapybaraLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  className?: string
  usePng?: boolean
}

export default function CapybaraLogo({ size = "md", animated = true, className = "", usePng = false }: CapybaraLogoProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 80, height: 80 },
    xl: { width: 120, height: 120 },
  }

  const { width, height } = sizeMap[size]

  if (usePng) {
    return (
      <div
        className={`inline-block cursor-pointer transition-all duration-300 ${
          animated ? "animate-bounce" : ""
        } ${isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src="/9165da84672d42ac99c42c0deb2e05db.png"
          alt="Capybara Logo"
          width={width}
          height={height}
          className="drop-shadow-lg"
        />
      </div>
    )
  }

  return (
    <div
      className={`inline-block cursor-pointer transition-all duration-300 text-[${width}px] ${
        animated ? "animate-bounce" : ""
      } ${isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      🦫
    </div>
  )
}
