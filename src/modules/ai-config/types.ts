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
  baseUrl?: string | null
  apiVersion?: string | null
  deploymentName?: string | null
}

export interface SaveAiProviderCommand {
  provider: AiProvider
  apiKey: string
  modelName?: string
  baseUrl?: string
  apiVersion?: string
  deploymentName?: string
}

export interface AiConnectionTestResult {
  success: boolean
  message: string
  provider: AiProvider
  modelName: string
  responseTimeMs: number
}
