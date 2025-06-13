class TTSService {
  private synth: SpeechSynthesis | null = null
  private availableVoices: SpeechSynthesisVoice[] = []
  private readyPromise: Promise<void>

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        this.synth = window.speechSynthesis
        const loadVoices = () => {
          this.availableVoices = this.synth!.getVoices()
          console.log("TTS Service voices loaded:", this.availableVoices.length)
          resolve()
        }
        // Load voices immediately if available, otherwise wait for them to be loaded
        if (this.synth.getVoices().length > 0) {
          loadVoices()
        } else {
          this.synth.onvoiceschanged = loadVoices
        }
      } else {
        console.warn("Speech synthesis not supported in this environment.")
        resolve() // Resolve even if not supported to prevent hanging
      }
    })
  }

  async initialize(): Promise<boolean> {
    await this.readyPromise
    return !!this.synth
  }

  async speak(
    text: string,
    personaSettings?: {
      rate?: number
      pitch?: number
      volume?: number
      voiceName?: string
      preferredVoiceIndex?: number
    },
  ): Promise<void> {
    if (!this.synth) {
      console.warn("Speech synthesis not available.")
      return
    }

    // Cancel any current speech before starting a new one
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)

    // Apply persona settings if provided
    if (personaSettings) {
      utterance.rate = personaSettings.rate || 2.0
      utterance.pitch = personaSettings.pitch || 2.0
      utterance.volume = personaSettings.volume || 1

      const selectedVoice = this.selectBestVoice(personaSettings.voiceName, personaSettings.preferredVoiceIndex)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    } else {
      // Default settings if no persona provided
      utterance.rate = 2.0
      utterance.pitch = 2.0
      utterance.volume = 1
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        resolve()
      }
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error("Speech synthesis error:", event.error || event) // Log specific error or the event object
        reject(new Error(`Speech synthesis failed: ${event.error || "Unknown error"}`))
      }
      this.synth!.speak(utterance)
    })
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false
  }

  private selectBestVoice(preferredGender?: string, preferredIndex?: number): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) return null

    const englishVoices = this.availableVoices.filter(
      (voice) =>
        voice.lang.startsWith("en-") &&
        !voice.name.toLowerCase().includes("novelty") &&
        !voice.name.toLowerCase().includes("whisper") &&
        !voice.name.toLowerCase().includes("zarvox"),
    )

    if (englishVoices.length === 0) return this.availableVoices[0]

    const premiumVoiceKeywords = [
      "premium",
      "enhanced",
      "neural",
      "wavenet",
      "polyglot",
      "natural",
      "samantha",
      "alex",
      "daniel",
      "karen",
      "moira",
      "tessa",
      "veena",
      "allison",
      "ava",
      "joanna",
      "matthew",
      "lotte",
      "siri",
    ]

    const naturalVoices = englishVoices.filter((voice) => {
      const name = voice.name.toLowerCase()
      return premiumVoiceKeywords.some((keyword) => name.includes(keyword))
    })

    const voicesToSearch = naturalVoices.length > 0 ? naturalVoices : englishVoices

    if (preferredGender) {
      const femaleKeywords = [
        "female",
        "woman",
        "girl",
        "samantha",
        "victoria",
        "karen",
        "moira",
        "tessa",
        "veena",
        "fiona",
        "susan",
        "allison",
        "ava",
        "joanna",
        "lisa",
        "catherine",
        "emily",
        "siri female",
      ]

      const maleKeywords = [
        "male",
        "man",
        "boy",
        "alex",
        "daniel",
        "tom",
        "fred",
        "ralph",
        "jorge",
        "matthew",
        "james",
        "john",
        "siri male",
      ]

      const genderVoices = voicesToSearch.filter((voice) => {
        const name = voice.name.toLowerCase()
        if (preferredGender === "female") {
          return femaleKeywords.some((keyword) => name.includes(keyword))
        } else {
          return maleKeywords.some((keyword) => name.includes(keyword))
        }
      })

      if (genderVoices.length > 0) {
        const index = preferredIndex !== undefined && preferredIndex < genderVoices.length ? preferredIndex : 0
        return genderVoices[index]
      }
    }

    return voicesToSearch[0] || this.availableVoices[0]
  }
}

export default TTSService
