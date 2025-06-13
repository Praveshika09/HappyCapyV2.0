// This file augments the global Window interface for Speech Recognition APIs.
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}
