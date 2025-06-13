"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, MessageCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button" // Import Button component
import Link from "next/link" // Import Link for external navigation

interface FeedbackPanelProps {
  stats: {
    totalMessages: number
    averageResponseTime: number
    fillerWords: number
    pauseCount: number
    confidenceScore: number
    engagementScore: number
    coherenceScore: number
    anxietyMarkers: number
  }
  lastMessage: string
  hasStartedChatting: boolean
}

export default function FeedbackPanel({ stats, lastMessage, hasStartedChatting }: FeedbackPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Live Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasStartedChatting ? (
          <>
            {/* Real-time Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <span className={`text-sm font-bold ${getScoreColor(stats.confidenceScore)}`}>
                  {stats.confidenceScore}%
                </span>
              </div>
              <Progress value={stats.confidenceScore} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement</span>
                <span className={`text-sm font-bold ${getScoreColor(stats.engagementScore)}`}>
                  {stats.engagementScore}%
                </span>
              </div>
              <Progress value={stats.engagementScore} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coherence</span>
                <span className={`text-sm font-bold ${getScoreColor(stats.coherenceScore)}`}>
                  {stats.coherenceScore}%
                </span>
              </div>
              <Progress value={stats.coherenceScore} className="h-2" />
            </div>

            {/* Session Metrics */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Messages: {stats.totalMessages}</span>
              </div>

              {stats.fillerWords > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Filler words: {stats.fillerWords}</span>
                </div>
              )}
              {stats.anxietyMarkers > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Anxiety markers: {stats.anxietyMarkers}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Start the conversation to see live feedback!</p>
          </div>
        )}

        {/* Tips - Always visible */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Quick Tips</h4>
          <div className="space-y-2">
            {hasStartedChatting && stats.confidenceScore < 70 && (
              <Badge variant="outline" className="text-xs">
                Try speaking more clearly
              </Badge>
            )}
            {hasStartedChatting && stats.fillerWords > 3 && (
              <Badge variant="outline" className="text-xs">
                Reduce filler words
              </Badge>
            )}
            {hasStartedChatting && stats.engagementScore < 70 && (
              <Badge variant="outline" className="text-xs">
                Ask more questions
              </Badge>
            )}
            {hasStartedChatting && stats.anxietyMarkers > 0 && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                Consider a deep breathing exercise
              </Badge>
            )}
            <Link href="https://serene-capy-calm-space-88.lovable.app/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Breathe
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
