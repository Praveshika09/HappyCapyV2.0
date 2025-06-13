"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  BarChart3,
  Users,
  MessageSquare,
  AlertCircle,
  Play,
  Pause,
  Info,
  Heart,
  UserCheck,
} from "lucide-react"
import PerformanceReport from "@/components/performance-report"
import FeedbackPanel from "@/components/feedback-panel"
import EmojiCharacter from "@/components/emoji-character"
import CapybaraLogo from "@/components/capybara-logo"
import TTSService from "@/lib/tts-service"
import { useChat } from "ai/react"

interface Persona {
  id: string
  name: string
  role: string
  personality: string
  avatar: string
  conversationStyle: string
  emoji: string
  voiceSettings: {
    rate: number
    pitch: number
    volume: number
    voiceName?: string
    preferredVoiceIndex?: number
  }
  position: {
    x: number
    y: number
  }
}

interface GroupScenario {
  id: string
  title: string
  description: string
  theme: string
  personas: Persona[]
}

interface GroupSimulationChatProps {
  scenario: GroupScenario
  onBack: () => void
}

export default function GroupSimulationChat({ scenario, onBack }: GroupSimulationChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")
  const [speechSupported, setSpeechSupported] = useState(true)
  const [isGroupActive, setIsGroupActive] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)
  const [hasStartedChatting, setHasStartedChatting] = useState(false)

  const [sessionStats, setSessionStats] = useState({
    totalMessages: 0,
    averageResponseTime: 3,
    fillerWords: 0,
    pauseCount: 0,
    confidenceScore: 0,
    engagementScore: 0,
    coherenceScore: 0,
    anxietyMarkers: 0,
  })
  const [lastUserMessage, setLastUserMessage] = useState<string>("")

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groupIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const ttsServiceRef = useRef<TTSService | null>(null)

  // Initialize TTSService only on the client side
  useEffect(() => {
    if (typeof window !== "undefined" && !ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService()
    }
    return () => {
      if (ttsServiceRef.current) {
        ttsServiceRef.current.stop()
      }
    }
  }, [])

  // Determine if this is a single-persona scenario
  const isSinglePersonaScenario = scenario.personas.length === 1
  const isPersonalAssistant = scenario.id === "personal-assistant"
  const isJobInterview = scenario.id === "job-interview"

  // Get seating positions
  function getSeatingPositions(personaCount: number) {
    if (personaCount === 1) {
      return [{ x: 50, y: 40 }]
    } else if (personaCount === 2) {
      return [
        { x: 35, y: 30 },
        { x: 65, y: 30 },
      ]
    } else if (personaCount === 3) {
      return [
        { x: 25, y: 30 },
        { x: 50, y: 25 },
        { x: 75, y: 30 },
      ]
    } else {
      const basePositions = [
        { x: 25, y: 30 },
        { x: 50, y: 25 },
        { x: 75, y: 30 },
        { x: 25, y: 70 },
        { x: 50, y: 75 },
        { x: 75, y: 70 },
      ]
      return basePositions.slice(0, personaCount)
    }
  }

  // Map personas to emojis
  function getEmojiForPersona(persona: any): string {
    const role = persona.role.toLowerCase()

    if (role.includes("wellness") || role.includes("coach")) return "🦫"  // Changed to capybara emoji
    if (role.includes("therapist") || role.includes("counselor")) return "👩‍⚕️"
    if (role.includes("hiring") || role.includes("manager")) return "👩‍💼"
    if (role.includes("technical") || role.includes("tech")) return "👨‍💻"
    if (role.includes("hr") || role.includes("representative")) return "👩‍💼"
    if (role.includes("teacher")) return "👩‍🏫"
    if (role.includes("instructor") || role.includes("professor")) return "👨‍🏫"
    if (role.includes("student") && persona.name.toLowerCase().includes("alex")) return "👦"
    if (role.includes("student") && persona.name.toLowerCase().includes("maya")) return "👧🏾"
    if (role.includes("student")) return Math.random() > 0.5 ? "👨‍🎓" : "👩‍🎓"
    if (role.includes("environmental")) return "👨‍🌾"
    if (role.includes("practical")) return "👩" // Changed from 🧑 to 👩
    if (role.includes("marketing")) return "👩‍💼"
    if (role.includes("developer")) return "👨‍💻"
    if (role.includes("mom") || role.includes("mother")) return "👩‍👧‍👦"
    if (role.includes("dad") || role.includes("father")) return "👨‍👧‍👦"
    if (role.includes("parent")) return Math.random() > 0.5 ? "👩‍👧" : "👨‍👦"
    if (role.includes("sibling")) return Math.random() > 0.5 ? "👦" : "👧"
    if (role.includes("friend") && role.includes("social")) return "🧑‍🤝‍🧑"
    if (role.includes("friend") && role.includes("chill")) return "😎"
    if (role.includes("friend") && role.includes("trendy")) return "💁‍♀️"
    if (role.includes("friend")) return Math.random() > 0.5 ? "🧑" : "👧"

    const fallbacks = ["👩", "👨", "👩‍🦱", "👨‍🦱", "👩‍🦰", "👨‍🦳", "👩‍🦳", "👨‍🦲", "👩‍🦲"]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  function getVoiceSettings(persona: Persona) {
    const voiceMap: Record<string, any> = {
      wellness: { rate: 1.0, pitch: 1.1, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      coach: { rate: 1.0, pitch: 1.05, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      therapist: { rate: 1.0, pitch: 1.0, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      counselor: { rate: 1.0, pitch: 1.0, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      hiring: { rate: 1.0, pitch: 1.0, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      technical: { rate: 1.0, pitch: 0.9, volume: 0.85, voiceName: "male", preferredVoiceIndex: 1 },
      hr: { rate: 1.0, pitch: 1.1, volume: 0.9, voiceName: "female", preferredVoiceIndex: 2 },
      teacher: { rate: 1.0, pitch: 0.9, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      manager: { rate: 1.0, pitch: 0.95, volume: 0.85, voiceName: "male", preferredVoiceIndex: 1 },
      student: { rate: 1.0, pitch: 1.15, volume: 0.9, voiceName: "female", preferredVoiceIndex: 2 },
      classmate: { rate: 0.8, pitch: 1.0, volume: 0.9, voiceName: "male", preferredVoiceIndex: 3 },
      parent: { rate: 0.65, pitch: 1.1, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      mom: { rate: 1.0, pitch: 1.2, volume: 0.9, voiceName: "female", preferredVoiceIndex: 0 },
      dad: { rate: 0.8, pitch: 0.85, volume: 0.85, voiceName: "male", preferredVoiceIndex: 1 },
      marketing: { rate: 0.75, pitch: 1.1, volume: 0.9, voiceName: "female", preferredVoiceIndex: 2 },
      developer: { rate: 0.7, pitch: 0.9, volume: 0.85, voiceName: "male", preferredVoiceIndex: 3 },
      friend: { rate: 0.8, pitch: 1.05, volume: 0.9, voiceName: "female", preferredVoiceIndex: 2 },
      sibling: { rate: 0.85, pitch: 1.0, volume: 0.9, voiceName: "male", preferredVoiceIndex: 3 },
    }

    const roleKey = persona.role.toLowerCase().split(" ")[0]
    return voiceMap[roleKey] || { rate: 0.75, pitch: 1.0, volume: 0.9 }
  }

  // Enhanced personas with emojis, voice settings and positions
  const enhancedScenario = {
    ...scenario,
    personas: scenario.personas.map((persona, index) => {
      const seatingPositions = getSeatingPositions(scenario.personas.length)
      return {
        ...persona,
        emoji: getEmojiForPersona(persona),
        voiceSettings: getVoiceSettings(persona),
        position: seatingPositions[index] || { x: 50, y: 50 },
      }
    }),
  }

  // Use the useChat hook for group conversation
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/group-chat",
    body: {
      scenario: enhancedScenario,
      theme: scenario.theme,
    },
    onResponse: (response) => {
      console.log("Group chat response status:", response.status)
      if (!response.ok) {
        setChatError(`Server error: ${response.status}`)
      } else {
        setChatError(null)
      }
    },
    onFinish: (message) => {
      console.log("Group chat finished with message:", message.content)

      const speakerMatch = message.content.match(/^\*\*([^*]+)\*\*:/)
      if (speakerMatch) {
        const speakerName = speakerMatch[1]
        setCurrentSpeaker(speakerName)

        const textToSpeak = message.content.replace(/^\*\*[^*]+\*\*:\s*/, "")
        speakText(textToSpeak, speakerName)
      } else {
        speakText(message.content)
      }

      setSessionStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        engagementScore: Math.min(100, prev.engagementScore + 2),
        coherenceScore: Math.min(100, prev.coherenceScore + 1),
      }))

      setChatError(null)
    },
    onError: (error) => {
      console.error("Group chat error details:", error)
      setChatError(error.message || "Failed to communicate with AI")
    },
  })

  // Check microphone permissions and speech recognition support
  useEffect(() => {
    const checkSpeechSupport = async () => {
      if (typeof window === "undefined") return

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setSpeechSupported(false)
        setSpeechError("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.")
        return
      }

      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
          setMicPermission(permission.state)

          permission.onchange = () => {
            setMicPermission(permission.state)
          }
        }
      } catch (error) {
        console.log("Permission API not supported, will request on first use")
        setMicPermission("prompt")
      }
    }

    checkSpeechSupport()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Group conversation simulation
  useEffect(() => {
    if (isGroupActive && messages.length > 0 && !isSinglePersonaScenario) {
      groupIntervalRef.current = setInterval(
        () => {
          if (!isLoading && Math.random() > 0.2) {
            triggerGroupResponse()
          }
        },
        3000 + Math.random() * 2000,
      )
    }

    return () => {
      if (groupIntervalRef.current) {
        clearInterval(groupIntervalRef.current)
      }
    }
  }, [isGroupActive, messages.length, isLoading, isSinglePersonaScenario])

  const triggerGroupResponse = () => {
    const syntheticEvent = new Event("submit") as any
    handleSubmit(syntheticEvent, {
      data: { triggerGroupResponse: true },
    })
  }

  const initializeSpeechRecognition = () => {
    if (typeof window === "undefined" || !speechSupported) return null

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("Speech recognition started")
      setSpeechError(null)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Speech recognition result:", transcript)

      handleInputChange({ target: { value: transcript } } as any)
      setIsListening(false)
      analyzeSpeech(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)

      switch (event.error) {
        case "not-allowed":
          setSpeechError("Microphone access denied. Please allow microphone permissions and try again.")
          setMicPermission("denied")
          break
        case "no-speech":
          setSpeechError("No speech detected. Please try speaking again.")
          break
        case "audio-capture":
          setSpeechError("No microphone found. Please check your microphone connection.")
          break
        case "network":
          setSpeechError("Network error occurred. Please check your internet connection.")
          break
        default:
          setSpeechError(`Speech recognition error: ${event.error}. Please try again.`)
      }
    }

    recognition.onend = () => {
      console.log("Speech recognition ended")
      setIsListening(false)
    }

    return recognition
  }

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicPermission("granted")
      setSpeechError(null)
      return true
    } catch (error) {
      console.error("Microphone permission denied:", error)
      setMicPermission("denied")
      setSpeechError(
        "Microphone access is required for voice input. Please allow microphone permissions in your browser settings.",
      )
      return false
    }
  }

  const startListening = async () => {
    if (!speechSupported) {
      setSpeechError("Speech recognition is not supported in this browser.")
      return
    }

    if (micPermission === "denied") {
      setSpeechError("Microphone access denied. Please enable microphone permissions in your browser settings.")
      return
    }

    if (micPermission !== "granted") {
      const granted = await requestMicrophonePermission()
      if (!granted) return
    }

    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      setSpeechError(null)
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        setIsListening(false)
        setSpeechError("Failed to start speech recognition. Please try again.")
      }
    } else if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition()
      if (recognitionRef.current) {
        setIsListening(true)
        setSpeechError(null)
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error("Failed to start speech recognition:", error)
          setIsListening(false)
          setSpeechError("Failed to start speech recognition. Please try again.")
        }
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = async (text: string, speakerName?: string) => {
    if (!ttsServiceRef.current) {
      console.warn("TTS Service not initialized.")
      setSpeechError("Text-to-speech service is not ready. Please try again.")
      return
    }
    try {
      if (ttsServiceRef.current.isSpeaking()) {
        ttsServiceRef.current.stop()
      }

      const persona = speakerName ? enhancedScenario.personas.find((p) => p.name === speakerName) : undefined
      setIsSpeaking(true)
      setCurrentSpeaker(speakerName || null)
      await ttsServiceRef.current.speak(text, persona?.voiceSettings)
      setIsSpeaking(false)
      setCurrentSpeaker(null)
    } catch (error) {
      console.error("TTS Error:", error)
      setIsSpeaking(false)
      setCurrentSpeaker(null)
      setSpeechError("Failed to play audio. Please try again.")
    }
  }

  const stopSpeaking = () => {
    if (ttsServiceRef.current) {
      ttsServiceRef.current.stop()
    }
    setIsSpeaking(false)
    setCurrentSpeaker(null)
  }

  const analyzeSpeech = (transcript: string) => {
    if (!hasStartedChatting) {
      setHasStartedChatting(true)
      setSessionStats((prev) => ({
        ...prev,
        confidenceScore: 75,
        engagementScore: 70,
        coherenceScore: 80,
      }))
    }

    const fillerWords = ["um", "uh", "like", "you know", "actually"]
    const fillerCount = fillerWords.reduce((count, word) => {
      return count + (transcript.toLowerCase().split(word).length - 1)
    }, 0)

    const anxietyWords = [
      "nervous",
      "anxious",
      "worried",
      "scared",
      "afraid",
      "stressed",
      "uncomfortable",
      "panic",
      "fear",
      "overwhelmed",
      "help",
      "can't",
      "difficult",
      "hard",
      "struggle",
    ]

    const anxietyCount = anxietyWords.reduce((count, word) => {
      return count + (transcript.toLowerCase().split(word).length - 1)
    }, 0)

    const positiveWords = ["confident", "excited", "ready", "understand", "clear", "good", "great", "yes"]
    const positiveCount = positiveWords.reduce((count, word) => {
      return count + (transcript.toLowerCase().split(word).length - 1)
    }, 0)

    setSessionStats((prev) => ({
      ...prev,
      fillerWords: prev.fillerWords + fillerCount,
      anxietyMarkers: prev.anxietyMarkers + anxietyCount,
      confidenceScore: Math.max(
        30,
        Math.min(100, prev.confidenceScore - fillerCount * 3 - anxietyCount * 5 + positiveCount * 2),
      ),
      coherenceScore:
        transcript.length > 10 ? Math.min(100, prev.coherenceScore + 2) : Math.max(50, prev.coherenceScore - 1),
      engagementScore: Math.min(100, prev.engagementScore + (transcript.includes("?") ? 3 : 1)),
    }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      console.log("Submitting message:", input)
      setLastUserMessage(input.trim())

      if (!hasStartedChatting) {
        setHasStartedChatting(true)
        setSessionStats((prev) => ({
          ...prev,
          confidenceScore: 75,
          engagementScore: 70,
          coherenceScore: 80,
        }))
      }

      setChatError(null)
      handleSubmit(e)
    }
  }

  const startGroupDiscussion = async () => {
    if (!ttsServiceRef.current) {
      setSpeechError("Text-to-speech service could not be initialized. Please try refreshing or check browser support.")
      return
    }

    setIsGroupActive(true)
    try {
      const initialized = await ttsServiceRef.current.initialize()
      if (!initialized) {
        setSpeechError(
          "Text-to-speech service could not be initialized. Please try refreshing or check browser support.",
        )
        return
      }
    } catch (error) {
      console.error("Error initializing TTS on start:", error)
      setSpeechError("Failed to initialize text-to-speech. Please try again.")
      return
    }

    const initialMessage = isSinglePersonaScenario
      ? `Hello! I'm here to listen and support you. How are you feeling today?`
      : `Let's start our discussion about ${scenario.theme}. What are your thoughts?`

    handleInputChange({ target: { value: initialMessage } } as any)
    setTimeout(() => {
      const syntheticEvent = new Event("submit") as any
      handleSubmit(syntheticEvent)
    }, 500)
  }

  const pauseGroupDiscussion = () => {
    setIsGroupActive(false)
    if (groupIntervalRef.current) {
      clearInterval(groupIntervalRef.current)
    }
  }

  const retryChat = () => {
    setChatError(null)
    reload()
  }

  const clearSpeechError = () => {
    setSpeechError(null)
  }

  if (showReport) {
    return (
      <PerformanceReport
        scenario={scenario}
        stats={sessionStats}
        messages={messages}
        onBack={() => setShowReport(false)}
        onHome={onBack}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-300 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-pink-300 rounded-full opacity-25 animate-bounce"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-emerald-50" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="hover:bg-purple-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CapybaraLogo size="sm" animated={true} />
            <div>
              <h1 className="text-xl font-bold text-purple-800">{scenario.title}</h1>
              <p className="text-sm text-purple-600">
                {isSinglePersonaScenario
                  ? `Session with ${enhancedScenario.personas[0].name}`
                  : `Theme: ${scenario.theme}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <MessageSquare className="h-3 w-3 mr-1" />
              {messages.length} messages
            </Badge>
            {!isSinglePersonaScenario && (
              <Button
                variant={isGroupActive ? "destructive" : "custom-green"}
                onClick={isGroupActive ? pauseGroupDiscussion : startGroupDiscussion}
              >
                {isGroupActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isGroupActive ? "Pause Discussion" : "Start Discussion"}
              </Button>
            )}
            {isSinglePersonaScenario && (
              <Button onClick={startGroupDiscussion} variant="custom-green" disabled={messages.length > 0}>
                <Heart className="h-4 w-4 mr-2" />
                {messages.length > 0 ? "Session Active" : "Start Session"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowReport(true)}
              className="border-purple-200 hover:bg-purple-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        <div className="w-80 p-4 space-y-4 bg-white/80 backdrop-blur-sm border-r border-purple-200 overflow-y-auto">
          <FeedbackPanel stats={sessionStats} lastMessage={lastUserMessage} hasStartedChatting={hasStartedChatting} />

          {(!speechSupported || speechError || micPermission === "denied") && (
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-purple-800">
                  <Info className="h-4 w-4" />
                  Voice Input Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!speechSupported && (
                  <div className="text-sm text-amber-600">
                    <p>Speech recognition not supported in this browser.</p>
                    <p className="text-xs mt-1">Try Chrome, Edge, or Safari for voice input.</p>
                  </div>
                )}
                {micPermission === "denied" && (
                  <div className="text-sm text-red-600">
                    <p>Microphone access denied.</p>
                    <p className="text-xs mt-1">Enable microphone permissions in browser settings.</p>
                  </div>
                )}
                {speechError && (
                  <div className="text-sm text-red-600">
                    <p>{speechError}</p>
                    <Button size="sm" variant="outline" onClick={clearSpeechError} className="mt-2">
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm text-purple-800">Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isSinglePersonaScenario
                        ? "Start by sharing how you're feeling"
                        : "Begin the conversation to see messages here"}
                    </p>
                  </div>
                ) : (
                  messages.slice(-5).map((message, index) => {
                    const speakerMatch = message.content.match(/^\*\*([^*]+)\*\*:/)
                    const speakerName = speakerMatch ? speakerMatch[1] : "You"
                    const messageContent = speakerMatch
                      ? message.content.replace(/^\*\*[^*]+\*\*:\s*/, "")
                      : message.content

                    return (
                      <div key={index} className="text-xs p-2 bg-purple-50 rounded border border-purple-100">
                        <div className="font-medium text-purple-700">{speakerName}:</div>
                        <div className="text-purple-600">{messageContent}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 p-8">
            {isPersonalAssistant ? (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${enhancedScenario.personas[0].position.y}%`,
                  left: `${enhancedScenario.personas[0].position.x}%`,
                }}
              >
                <CapybaraLogo
                  size="xl"
                  animated={currentSpeaker === enhancedScenario.personas[0].name && isSpeaking}
                  className="drop-shadow-lg"
                  usePng={true}
                />
                <div className="mt-2 text-center">
                  <div className="text-lg font-medium text-purple-700">{enhancedScenario.personas[0].name}</div>
                  <div className="text-sm text-gray-600">{enhancedScenario.personas[0].role}</div>
                </div>
                {currentSpeaker === enhancedScenario.personas[0].name && isSpeaking && (
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-48 speech-bubble">
                    <div className="bg-white rounded-lg p-3 shadow-lg border relative">
                      <div className="text-xs text-gray-700 leading-tight">💬 Speaking...</div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              enhancedScenario.personas.map((persona, index) => (
                <EmojiCharacter
                  key={persona.id}
                  persona={persona}
                  isActive={currentSpeaker === persona.name}
                  isSpeaking={currentSpeaker === persona.name && isSpeaking}
                  position={persona.position}
                  seatPosition={index}
                />
              ))
            )}

            <div
              className={`absolute ${isSinglePersonaScenario ? "bottom-8 left-1/2" : "bottom-8 left-1/2"} transform -translate-x-1/2`}
            >
              <div className="text-center">
                <div
                  className={`w-20 h-20 rounded-full border-4 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center transition-all duration-300 ${isListening ? "border-pink-500 animate-pulse scale-110 shadow-lg" : "border-purple-500 shadow-md"
                    }`}
                >
                  {isSinglePersonaScenario ? (
                    <Heart className="h-8 w-8 text-purple-600" />
                  ) : (
                    <Users className="h-8 w-8 text-purple-600" />
                  )}
                </div>
                <div className="mt-2 text-sm font-medium text-[hsl(var(--green-text))]">You</div>
                {isListening && (
                  <div className="mt-1 text-xs text-[hsl(var(--green-text))] animate-pulse flex items-center justify-center gap-1">
                    🎤 Listening...
                  </div>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-200">
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span className="ml-2">
                      {isSinglePersonaScenario ? "Listening and thinking..." : "Someone is thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(error || chatError) && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Connection Error</span>
                  </div>
                  <p className="text-red-600 text-sm mb-3">
                    {chatError || error?.message || "Failed to communicate with the AI. Please try again."}
                  </p>
                  <Button size="sm" variant="outline" onClick={retryChat}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-purple-200 max-w-md">
                  {isPersonalAssistant && (
                    <>
                      <Heart className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">Welcome to Your Safe Space</h3>
                      <p className="text-purple-600 text-sm mb-4">
                        This is a judgment-free zone where you can share your feelings and get support. Dr. Riley is
                        here to listen and help you feel better.
                      </p>
                      <p className="text-purple-500 text-xs">
                        💡 Try starting with: "I'm feeling..." or "Today has been..."
                      </p>
                    </>
                  )}
                  {isJobInterview && (
                    <>
                      <UserCheck className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">Job Interview Practice</h3>
                      <p className="text-purple-600 text-sm mb-4">
                        Practice your interview skills in a supportive environment. The interview panel will ask you
                        questions about your experience and skills.
                      </p>
                      <p className="text-purple-500 text-xs">
                        💡 Try starting with: "I'm ready for the interview" or "Hello, nice to meet you"
                      </p>
                    </>
                  )}
                  {!isSinglePersonaScenario && !isJobInterview && (
                    <>
                      <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">Group Discussion</h3>
                      <p className="text-purple-600 text-sm mb-4">
                        Join the conversation about {scenario.theme}. Share your thoughts and engage with the group!
                      </p>
                      <p className="text-purple-500 text-xs">
                        💡 Try starting the discussion or click "Start Discussion" above
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
            <Card className="border-purple-200 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={isSinglePersonaScenario ? "Share how you're feeling..." : "Join the conversation..."}
                    className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading || !speechSupported}
                    className={isListening ? "" : "border-purple-200 hover:bg-purple-50"}
                    title={
                      !speechSupported
                        ? "Speech recognition not supported"
                        : micPermission === "denied"
                          ? "Microphone access denied"
                          : isListening
                            ? "Stop listening"
                            : "Start voice input"
                    }
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={isSpeaking ? stopSpeaking : () => { }}
                    disabled={!isSpeaking}
                    className="border-purple-200 hover:bg-purple-50"
                    title={isSpeaking ? "Stop speaking" : "Text-to-speech"}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="submit"
                    variant="custom-green"
                    disabled={isLoading || !input.trim()}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    Send
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

