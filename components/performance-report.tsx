"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Home, Download, TrendingUp, MessageSquare, Target } from "lucide-react"

interface PerformanceReportProps {
  scenario: any
  stats: {
    totalMessages: number
    averageResponseTime: number
    fillerWords: number
    pauseCount: number
    confidenceScore: number
    engagementScore: number
    coherenceScore: number
  }
  messages: any[]
  onBack: () => void
  onHome: () => void
}

export default function PerformanceReport({ scenario, stats, messages, onBack, onHome }: PerformanceReportProps) {
  const overallScore = Math.round((stats.confidenceScore + stats.engagementScore + stats.coherenceScore) / 3)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[hsl(var(--green-text))]"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const exportReport = () => {
    const reportData = {
      scenario: scenario.title,
      timestamp: new Date().toISOString(),
      stats,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt,
      })),
      overallScore,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `happycapy-report-${scenario.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateInsights = () => {
    const insights = []

    if (stats.confidenceScore >= 80) {
      insights.push("Great confidence! You spoke clearly and with conviction.")
    } else if (stats.confidenceScore >= 60) {
      insights.push("Good confidence level. Try to speak a bit more assertively.")
    } else {
      insights.push("Work on building confidence. Practice speaking louder and clearer.")
    }

    if (stats.engagementScore >= 80) {
      insights.push("Excellent engagement! You maintained great conversation flow.")
    } else if (stats.engagementScore >= 60) {
      insights.push("Good engagement. Try asking more questions to keep conversations active.")
    } else {
      insights.push("Focus on engagement. Ask questions and show interest in responses.")
    }

    if (stats.fillerWords > 5) {
      insights.push("Try to reduce filler words like 'um', 'uh', and 'like' for clearer communication.")
    }

    if (stats.totalMessages < 5) {
      insights.push("Consider having longer conversations to practice more scenarios.")
    }

    return insights
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Performance Report</h1>
              <p className="text-gray-600">{scenario.title} Simulation</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={onHome} variant="green">
              {" "}
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
              <div className="text-xl text-gray-600 mt-2">Overall Score</div>
            </div>
            <Badge variant={getScoreBadgeVariant(overallScore)} className="text-lg px-4 py-2">
              {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats.confidenceScore}%</span>
                  <Badge variant={getScoreBadgeVariant(stats.confidenceScore)}>
                    {stats.confidenceScore >= 80 ? "High" : stats.confidenceScore >= 60 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <Progress value={stats.confidenceScore} className="h-3" />
                <p className="text-sm text-gray-600">Based on speech clarity, volume, and assertiveness</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--green-text))]" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats.engagementScore}%</span>
                  <Badge variant={getScoreBadgeVariant(stats.engagementScore)}>
                    {stats.engagementScore >= 80 ? "High" : stats.engagementScore >= 60 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <Progress value={stats.engagementScore} className="h-3" />
                <p className="text-sm text-gray-600">Based on conversation flow and interaction quality</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Coherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats.coherenceScore}%</span>
                  <Badge variant={getScoreBadgeVariant(stats.coherenceScore)}>
                    {stats.coherenceScore >= 80 ? "High" : stats.coherenceScore >= 60 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <Progress value={stats.coherenceScore} className="h-3" />
                <p className="text-sm text-gray-600">Based on message structure and logical flow</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Session Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[hsl(var(--green-text))]}">{stats.fillerWords}</div>
                <div className="text-sm text-gray-600">Filler Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.pauseCount}</div>
                <div className="text-sm text-gray-600">Long Pauses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.averageResponseTime)}s</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Generated Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generateInsights().map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-[hsl(var(--green-text))]/10 to-blue-50 rounded-lg">
              {" "}
              <h4 className="font-medium text-[hsl(var(--green-text))]} mb-2">Next Steps</h4>{" "}
              <ul className="text-sm text-[hsl(var(--green-text))]/90 space-y-1">
                {" "}
                <li>• Practice the same scenario again to improve your scores</li>
                <li>• Try a different scenario to expand your social skills</li>
                <li>• Focus on areas where you scored below 70%</li>
                <li>• Review the conversation transcript for learning opportunities</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
