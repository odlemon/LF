export type AiProvider = 'ANTHROPIC' | 'OPENAI' | 'GEMINI' | 'DEEPSEEK'

export interface AiProviderConfig {
  id: string
  firmUid: string
  provider: AiProvider
  displayName: string
  modelName: string
  apiKeyHint: string
  active: boolean
  lastTestedAt: string | null
  lastTestResult: 'SUCCESS' | 'FAILED' | null
  createdAt: string
}

export interface SaveAiProviderCommand {
  provider: AiProvider
  apiKey: string
  modelName?: string
}

export interface AiConnectionTestResult {
  success: boolean
  message: string
  provider: AiProvider
  modelName: string
  responseTimeMs: number
}
