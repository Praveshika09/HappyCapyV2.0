"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  School,
  Briefcase,
  Home,
  Users,
  Target,
  BarChart3,
  MessageCircle,
  Sparkles,
  Heart,
  UserCheck,
} from "lucide-react"
import GroupSimulationChat from "@/components/group-simulation-chat"
import CapybaraLogo from "@/components/capybara-logo"

const groupScenarios = [
  {
    id: "personal-assistant",
    title: "Personal Wellness Assistant",
    description: "Talk with a caring AI assistant about your feelings and well-being",
    icon: Heart,
    theme: "Mental Health & Emotional Support",
    personas: [
      {
        id: "wellness-coach",
        name: "Dr. Riley",
        role: "Wellness Coach",
        personality:
          "Warm, empathetic wellness coach who specializes in anxiety management and emotional support. Always listens without judgment and provides gentle guidance. if the user says they are too anxious or tell them we have breathing exercise module that they can practice,",
        avatar: "/placeholder.svg?height=100&width=100&text=Wellness+Coach+Avatar",
        conversationStyle:
          "Asks gentle, open-ended questions about feelings, validates emotions, suggests coping strategies, practices active listening",
      },
    ],
  },
  {
    id: "family-dinner",
    title: "Family Dinner Discussion",
    description: "Navigate family conversations during dinner time",
    icon: Home,
    theme: "Planning Summer Vacation",
    personas: [
      {
        id: "parent1",
        name: "Mom",
        role: "Parent",
        personality: "Caring parent who wants everyone to have input on vacation planning while considering budget",
        avatar: "/placeholder.svg?height=100&width=100&text=Mom+Avatar",
        conversationStyle: "Asks for everyone's preferences, discusses budget, suggests compromises",
      },
      {
        id: "parent2",
        name: "Dad",
        role: "Parent",
        personality: "Fun-loving parent who suggests adventurous activities and outdoor experiences",
        avatar: "/placeholder.svg?height=100&width=100&text=Dad+Avatar",
        conversationStyle: "Proposes exciting activities, shares travel stories, encourages exploration",
      },
      {
        id: "sibling",
        name: "Jamie",
        role: "Sibling",
        personality: "Teenager who has strong opinions about vacation destinations and activities",
        avatar: "/placeholder.svg?height=100&width=100&text=Sibling+Avatar",
        conversationStyle: "Expresses preferences strongly, negotiates for desired activities, suggests alternatives",
      },
    ],
  },
  {
    id: "friend-hangout",
    title: "Friend Group Hangout",
    description: "Casual conversation with a group of friends",
    icon: Users,
    theme: "Weekend Plans & Social Media",
    personas: [
      {
        id: "friend1",
        name: "Emma",
        role: "Social Organizer",
        personality: "Outgoing friend who loves planning group activities and staying connected on social media",
        avatar: "/placeholder.svg?height=100&width=100&text=Emma+Avatar",
        conversationStyle: "Suggests activities, shares social media updates, coordinates group plans",
      },
      {
        id: "friend2",
        name: "Jordan",
        role: "Chill Friend",
        personality: "Laid-back friend who prefers low-key activities and meaningful conversations",
        avatar: "/placeholder.svg?height=100&width=100&text=Jordan+Avatar",
        conversationStyle: "Suggests relaxed activities, asks deeper questions, shares personal thoughts",
      },
      {
        id: "friend3",
        name: "Casey",
        role: "Trendy Friend",
        personality: "Fashion-conscious friend who knows about latest trends and popular spots",
        avatar: "/placeholder.svg?height=100&width=100&text=Casey+Avatar",
        conversationStyle: "Talks about trends, suggests trendy places, discusses fashion and culture",
      },
    ],
  },
  {
    id: "classroom-discussion",
    title: "Classroom Group Discussion",
    description: "Participate in academic discussions with classmates and teacher",
    icon: School,
    theme: "Climate Change Solutions",
    personas: [
      {
        id: "teacher",
        name: "Ms. Thompson",
        role: "Teacher",
        personality:
          "Encouraging teacher who facilitates discussions and asks thought-provoking questions about environmental issues",
        avatar: "/placeholder.svg?height=100&width=100&text=Teacher+Avatar",
        conversationStyle: "Asks open-ended questions, encourages participation, provides educational context",
      },
      {
        id: "student1",
        name: "Alex",
        role: "Environmental Enthusiast",
        personality: "Passionate student who loves discussing renewable energy and sustainable practices",
        avatar: "/placeholder.svg?height=100&width=100&text=Alex+Avatar",
        conversationStyle: "Shares facts about green technology, asks about personal environmental habits",
      },
      {
        id: "student2",
        name: "Maya",
        role: "Practical Thinker",
        personality: "Pragmatic student who focuses on realistic solutions and economic considerations",
        avatar: "/placeholder.svg?height=100&width=100&text=Maya+Avatar",
        conversationStyle: "Questions feasibility, discusses costs and benefits, offers practical alternatives",
      },
    ],
  },
  {
    id: "workplace-meeting",
    title: "Team Meeting",
    description: "Collaborate in a professional team meeting environment",
    icon: Briefcase,
    theme: "Product Launch Strategy",
    personas: [
      {
        id: "manager",
        name: "David Chen",
        role: "Project Manager",
        personality:
          "Results-oriented manager who keeps meetings focused and encourages team input on product strategy",
        avatar: "/placeholder.svg?height=100&width=100&text=Manager+Avatar",
        conversationStyle: "Sets agenda, asks for updates, makes decisions, delegates tasks",
      },
      {
        id: "marketing",
        name: "Sarah Kim",
        role: "Marketing Specialist",
        personality: "Creative marketer focused on brand positioning and customer engagement strategies",
        avatar: "/placeholder.svg?height=100&width=100&text=Marketing+Avatar",
        conversationStyle: "Discusses target audience, suggests promotional ideas, analyzes market trends",
      },
      {
        id: "developer",
        name: "Mike Rodriguez",
        role: "Lead Developer",
        personality: "Technical expert who explains product features and discusses implementation challenges",
        avatar: "/placeholder.svg?height=100&width=100&text=Developer+Avatar",
        conversationStyle: "Explains technical aspects, discusses timelines, addresses feasibility concerns",
      },
    ],
  },
  {
    id: "job-interview",
    title: "Job Interview Simulation",
    description: "Practice answering interview questions with hiring managers",
    icon: UserCheck,
    theme: "Software Developer Position Interview",
    personas: [
      {
        id: "hiring-manager",
        name: "Ms. Thompson",
        role: "Hiring Manager",
        personality:
          "Professional hiring manager who asks thoughtful questions about experience, skills, and cultural fit. Encouraging but thorough in evaluation.",
        avatar: "/placeholder.svg?height=100&width=100&text=Hiring+Manager+Avatar",
        conversationStyle:
          "Asks behavioral and technical questions, follows up on answers, provides feedback on responses",
      },
      {
        id: "tech-lead",
        name: "James Park",
        role: "Technical Lead",
        personality:
          "Experienced technical lead who focuses on problem-solving abilities and technical knowledge. Supportive but wants to understand depth of knowledge.",
        avatar: "/placeholder.svg?height=100&width=100&text=Tech+Lead+Avatar",
        conversationStyle: "Asks technical questions, discusses past projects, explores problem-solving approach",
      },
      {
        id: "hr-representative",
        name: "Sarah Martinez",
        role: "HR Representative",
        personality:
          "Friendly HR professional who focuses on company culture, career goals, and ensuring candidate comfort during the interview process.",
        avatar: "/placeholder.svg?height=100&width=100&text=HR+Rep+Avatar",
        conversationStyle: "Asks about career goals, company culture fit, explains benefits and next steps",
      },
    ],
  },
]

export default function HomePage() {
  const [selectedScenario, setSelectedScenario] = useState<any>(null)

  if (selectedScenario) {
    return <GroupSimulationChat scenario={selectedScenario} onBack={() => setSelectedScenario(null)} />
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-300 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-pink-300 rounded-full opacity-25 animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4">
        {/* Header with Capybara Logo as main element */}
        <div className="text-center mb-12 pt-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <CapybaraLogo 
              size="xl" 
              animated={true}
              className="w-32 h-32"
              usePng={true}
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              HappyCapy
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-lg font-medium text-purple-700">Social Simulation Platform</span>
            </div>
          </div>
          <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
            Practice conversations in realistic social settings. From group discussions to personal wellness chats and
            job interviews - build confidence with our friendly capybara companion! 🌟
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Diverse Conversations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700">Engage with multiple AI personas in realistic group discussions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-full">
                  <Target className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-purple-800">Targeted Practice</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700">Each scenario focuses on specific skills and conversation types</p>
              </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Performance Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700">Get real-time feedback and track your communication progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Group Scenarios */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">Choose Your Conversation Practice</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupScenarios.map((scenario) => {
              const IconComponent = scenario.icon
              return (
                <Card
                  key={scenario.id}
                  className="flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm border-purple-200 hover:border-purple-300"
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                        <IconComponent className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-purple-800">{scenario.title}</CardTitle>
                        <CardDescription className="text-purple-600">{scenario.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between">
                    <div>
                      <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        {scenario.theme}
                      </Badge>
                      <p className="text-sm font-medium text-purple-700 mb-2">
                        {scenario.personas.length === 1 ? "AI Assistant:" : "Group Members:"}
                      </p>
                      <div className="flex flex-col gap-2">
                        {scenario.personas.map((persona) => (
                          <div key={persona.id} className="flex items-center gap-2 text-sm">
                            <span className="text-2xl" role="img" aria-label="persona">
                              {persona.role === "Teacher" ? "👩‍🏫" :
                              persona.role === "Wellness Coach" ? "🦫" :
                              persona.role === "Parent" ? "👨‍👩‍👧‍👦" :
                              persona.role === "Social Organizer" ? "🤝" :
                              persona.role === "Hiring Manager" ? "👔" :
                              persona.role === "Project Manager" ? "🗂️" :
                              persona.role === "Lead Developer" ? "👨‍💻" :
                              persona.role === "Technical Lead" ? "🧑‍💻" :
                              persona.role === "Environmental Enthusiast" ? "🌿" :
                              persona.role === "HR Representative" ? "🧑‍💼" :
                              persona.role === "Marketing Specialist" ? "📣" :
                              persona.role === "Trendy Friend" ? "🕶️" :
                              persona.role === "Chill Friend" ? "🧘‍♂️" :
                              persona.role === "Sibling" ? "🧒" :
                              persona.role === "Practical Thinker" ? "💁‍♀️" :
                              "👤"}
                            </span>

                            <span className="font-medium text-purple-800">{persona.name}</span>
                            <span className="text-purple-600">({persona.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4 shadow-lg hover:shadow-xl transition-all duration-300" variant="custom-green">
                      Start
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer with Capybara */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <CapybaraLogo size="sm" animated={true} usePng={true} />
            <span className="text-sm">Made with 💜 for better social connections</span>
            <CapybaraLogo size="sm" animated={true} usePng={true} />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

