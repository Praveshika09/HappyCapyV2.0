import { cn } from "@/lib/utils"

interface Persona {
  id: string
  name: string
  role: string
  emoji: string
  position: {
    x: number
    y: number
  }
}

interface EmojiCharacterProps {
  persona: Persona
  isActive: boolean
  isSpeaking: boolean
  position: { x: number; y: number }
  seatPosition: number // Added for potential future use or specific styling
}

export default function EmojiCharacter({ persona, isActive, isSpeaking, position }: EmojiCharacterProps) {
  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-300 ease-in-out"
      style={{
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-4xl sm:text-5xl transition-all duration-300",
          isActive ? "ring-4 ring-pink-500 scale-110 shadow-lg" : "ring-2 ring-purple-300",
          isSpeaking ? "animate-pulse bg-gradient-to-br from-pink-100 to-purple-100" : "bg-white/80 backdrop-blur-sm",
        )}
      >
        {persona.emoji}
        {isSpeaking && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-24 text-center">
            <span className="bg-white rounded-full px-3 py-1 text-xs shadow-md border border-purple-200">
              💬 Speaking...
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs sm:text-sm font-medium text-purple-800">{persona.name}</div>
        <div className="text-[10px] sm:text-xs text-gray-600">{persona.role}</div>
      </div>
    </div>
  )
}
