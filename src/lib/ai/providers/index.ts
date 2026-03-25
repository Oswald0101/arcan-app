// src/lib/ai/providers/index.ts

import type { AICompletionParams, AICompletionResult } from '@/types/guide'

export interface AIProvider {
  name: string
  complete(params: AICompletionParams): Promise<AICompletionResult>
  isAvailable(): boolean
}

// ===== ANTHROPIC =====

class AnthropicProvider implements AIProvider {
  name = 'anthropic'

  isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY)
  }

  async complete(params: AICompletionParams): Promise<AICompletionResult> {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const model = process.env.AI_MODEL ?? 'claude-haiku-4-5-20251001'

    const response = await client.messages.create({
      model,
      max_tokens: params.maxTokens ?? 1024,
      system: params.systemPrompt,
      messages: params.messages,
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected AI response')

    return {
      content: block.text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model,
    }
  }
}

// ===== DEEPSEEK =====

class DeepSeekProvider implements AIProvider {
  name = 'deepseek'

  isAvailable(): boolean {
    return Boolean(process.env.DEEPSEEK_API_KEY)
  }

  async complete(params: AICompletionParams): Promise<AICompletionResult> {
    const { default: OpenAI } = await import('openai')

    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    })

    const model = process.env.AI_MODEL ?? 'deepseek-chat'

    const messages: any[] = []

    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt })
    }

    for (const m of params.messages) {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      })
    }

    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: params.maxTokens ?? 1024,
    })

    return {
      content: response.choices[0]?.message?.content ?? '',
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      model,
    }
  }
}

// ===== PROVIDERS =====

const providers: Record<string, AIProvider> = {
  anthropic: new AnthropicProvider(),
  deepseek: new DeepSeekProvider(),
}

// ===== SELECTOR =====

export function getActiveProvider(): AIProvider {
  const key = process.env.AI_PROVIDER ?? 'anthropic'

  console.log('AI_PROVIDER =', key)

  const provider = providers[key]

  if (!provider) {
    throw new Error(`Provider inconnu: ${key}`)
  }

  if (!provider.isAvailable()) {
    throw new Error(`Provider non configuré: ${key}`)
  }

  return provider
}

export async function complete(params: AICompletionParams): Promise<AICompletionResult> {
  return getActiveProvider().complete(params)
}