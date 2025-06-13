"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, BarChart3, Users, MessageSquare, AlertCircle } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import PerformanceReport from "@/components/performance-report"
import FeedbackPanel from "@/components/feedback-panel"

interface Persona {
  id: string
  name: string
  role: string
  personality: string
  avatar: string
}

interface Scenario {
  id: string
  title: string
  description: string
  background: string
  personas: Persona[]
}

interface SimulationChatProps {
  scenario: Scenario
  onBack: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export default function SimulationChat({ scenario, onBack }: SimulationChatProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(scenario.personas[0])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState({
    totalMessages: 0,
    averageResponseTime: 0,
    fillerWords: 0,
    pauseCount: 0,
    confidenceScore: 85,
    engagementScore: 78,
    coherenceScore: 82,
  })

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use the useChat hook with proper configuration
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/chat",
    body: {
      persona: selectedPersona,
      scenario: scenario.id,
    },
    onResponse: (response) => {
      console.log("Chat response status:", response.status)
      if (!response.ok) {
        setChatError(`Server error: ${response.status}`)
      } else {
        setChatError(null)
      }
    },
    onFinish: (message) => {
      console.log("Chat finished with message:", message.content)
      // Speak the AI response
      speakText(message.content)

      // Update session stats
      setSessionStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
      }))

      setChatError(null)
    },
    onError: (error) => {
      console.error("Chat error details:", error)
      setChatError(error.message || "Failed to communicate with AI")
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          console.log("Speech recognition result:", transcript)

          // Update input field
          handleInputChange({ target: { value: transcript } } as any)
          setIsListening(false)

          // Analyze speech for feedback
          analyzeSpeech(transcript)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      } else {
        console.warn("Speech recognition not supported in this browser")
      }
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [handleInputChange])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 3.0
      utterance.pitch = selectedPersona.id === "teacher" ? 4.0 : 2.4

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const analyzeSpeech = (transcript: string) => {
    // Analyze for filler words
    const fillerWords = ["um", "uh", "like", "you know", "actually"]
    const fillerCount = fillerWords.reduce((count, word) => {
      return count + (transcript.toLowerCase().split(word).length - 1)
    }, 0)

    // Update stats
    setSessionStats((prev) => ({
      ...prev,
      fillerWords: prev.fillerWords + fillerCount,
      confidenceScore: Math.max(60, prev.confidenceScore - fillerCount * 2),
      coherenceScore: transcript.length > 10 ? Math.min(100, prev.coherenceScore + 1) : prev.coherenceScore,
    }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      console.log("Submitting message:", input)
      setChatError(null)
      handleSubmit(e)
    }
  }

  const retryChat = () => {
    setChatError(null)
    reload()
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
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${scenario.background})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{scenario.title}</h1>
                <p className="text-sm text-gray-600">
                  Talking with {selectedPersona.name} ({selectedPersona.role})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <MessageSquare className="h-3 w-3 mr-1" />
                {messages.length} messages
              </Badge>
              <Button variant="outline" onClick={() => setShowReport(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Report
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex max-w-6xl mx-auto w-full p-4 gap-4">
          {/* Persona Selection */}
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Personas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenario.personas.map((persona) => (
                  <div
                    key={persona.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedPersona.id === persona.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => setSelectedPersona(persona)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatar || "/placeholder.svg"}
                        alt={persona.name}
                        className={`w-12 h-12 rounded-full ${isSpeaking && selectedPersona.id === persona.id ? "animate-pulse ring-2 ring-blue-500" : ""
                          }`}
                      />
                      <div>
                        <h3 className="font-medium">{persona.name}</h3>
                        <p className="text-sm text-gray-600">{persona.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{persona.personality}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <FeedbackPanel stats={sessionStats} />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 p-4">
                <div className="h-96 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 && !chatError && (
                    <div className="text-center text-gray-500 mt-8">
                      <p>Start a conversation with {selectedPersona.name}!</p>
                      <p className="text-sm mt-2">Use the microphone or type your message below.</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <img
                          src={selectedPersona.avatar || "/placeholder.svg"}
                          alt={selectedPersona.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <img
                        src={selectedPersona.avatar || "/placeholder.svg"}
                        alt={selectedPersona.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(error || chatError) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Type your message or use voice..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant={isListening ? "destructive" : "outline"}
                      onClick={isListening ? stopListening : startListening}
                      disabled={isLoading}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={isSpeaking ? stopSpeaking : () => { }}
                      disabled={!isSpeaking}
                    >
                      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="flex-shrink-0"
                      variant="default"
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
