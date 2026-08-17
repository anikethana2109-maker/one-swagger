# Future Roadmap & Archived Features Specification (v2.0+)

This document provides a comprehensive archive of the **AI Debugger** and **Request History / Cloud Sync & Payments** modules built for **Backend Swagger**. It includes complete architectural designs, TypeScript source references, API provider integration patterns, and the v2.0 database/subscription roadmap so they can easily be re-enabled or expanded in future versions.

---

## 1. Archived Feature: Context-Aware Free AI Debugger

### 1.1 Architectural Concept: The Context Envelope
Standard AI coding assistants lack browser/API execution context. The Backend Swagger AI Debugger solves this by creating an automated **Context Envelope** whenever an API request fails (e.g. 422 Unprocessable Entity, 400 Bad Request, 500 Internal Server Error, or CORS/network errors).

```
+-------------------------------------------------------------------------+
|                           CONTEXT ENVELOPE                              |
+-------------------------------------------------------------------------+
| 1. Endpoint Metadata: Method, Path, Summary, OperationId               |
| 2. OpenAPI Schema Definition (Pydantic / JSON Schema constraints)      |
| 3. Outgoing Request: URL, Headers, Query Params, Request Body          |
| 4. Server Response: HTTP Status, Response Headers, Error Details       |
| 5. Diagnostic Goal: Identify why request failed & generate valid JSON  |
+-------------------------------------------------------------------------+
                                    |
                                    v
          [ AI Provider (Gemini / Ollama / Groq / OpenAI) ]
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            AI DIAGNOSIS                                 |
| - Root cause explanation (e.g. "Field 'price' must be > 0")             |
| - Fixed, valid JSON payload ready for testing                           |
| - [ 1-Click "Apply Fix to Editor" Button ]                              |
+-------------------------------------------------------------------------+
```

### 1.2 Supported AI Providers & Integration Patterns

#### A. Google Gemini 2.0 Flash (Free Tier BYOK)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}`
- **Pricing**: Free tier includes 15 RPM (Requests Per Minute) and 1,500 RPD (Requests Per Day), ideal for developer testing.
- **Request Format**:
  ```json
  {
    "contents": [
      {
        "role": "user",
        "parts": [{ "text": "SYSTEM PROMPT + CONTEXT ENVELOPE JSON" }]
      }
    ],
    "generationConfig": {
      "temperature": 0.2,
      "maxOutputTokens": 2048
    }
  }
  ```

#### B. Ollama (100% Free, Localhost, Offline)
- **Endpoint**: `http://localhost:11434/api/generate`
- **Default Models**: `llama3.2:latest`, `qwen2.5-coder:7b`, `mistral:latest`
- **No API Key Required**: Fully private, runs on the developer's local machine without sending data externally.

#### C. Groq Cloud (Free Tier, Ultra-low Latency)
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Default Model**: `llama-3.3-70b-versatile`
- **Latency**: ~200-400ms generation speed with generous free tier.

#### D. OpenAI Compatible BYOK
- **Endpoint**: `https://api.openai.com/v1/chat/completions` (or any custom base URL like DeepSeek, OpenRouter, Together.ai)
- **Default Model**: `gpt-4o-mini`

---

### 1.3 Archived TypeScript Source Code Reference

#### `ai.ts` (Data Types)
```typescript
export type AIProvider = 'gemini' | 'ollama' | 'groq' | 'openai';

export interface AISettings {
  provider: AIProvider;
  geminiKey?: string;
  groqKey?: string;
  openaiKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

export interface ContextEnvelope {
  endpoint: {
    path: string;
    method: string;
    summary?: string;
  };
  schema?: any;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    data?: any;
    rawText?: string;
  };
  errorMessage?: string;
}

export interface AIDebugResponse {
  diagnosis: string;
  suggestedFix?: string;
  suggestedBodyPayload?: any;
  explanation: string;
}
```

#### `contextEnvelopeBuilder.ts`
```typescript
import { ContextEnvelope } from '../../types/ai';
import { ParsedEndpoint } from '../../types/openapi';
import { HttpRequestConfig, HttpResponseResult } from '../../types/http';

export function buildContextEnvelope(
  endpoint: ParsedEndpoint | null,
  request: HttpRequestConfig,
  response: HttpResponseResult | null,
  customError?: string
): ContextEnvelope {
  return {
    endpoint: {
      path: endpoint?.path || request.url,
      method: (endpoint?.method || request.method).toUpperCase(),
      summary: endpoint?.summary || 'Ad-hoc Request'
    },
    schema: endpoint?.requestBody?.content?.['application/json']?.schema || null,
    request: {
      url: request.url,
      method: request.method.toUpperCase(),
      headers: request.headers,
      params: request.params,
      body: request.body
    },
    response: response
      ? {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          rawText: response.rawText
        }
      : undefined,
    errorMessage: customError
  };
}
```

#### `aiService.ts` (Unified Multi-Provider Dispatcher)
```typescript
import { AISettings, ContextEnvelope, AIDebugResponse } from '../../types/ai';

export async function sendAIDebugRequest(
  envelope: ContextEnvelope,
  settings: AISettings
): Promise<AIDebugResponse> {
  const prompt = `
You are Backend Swagger's Expert AI API Debugger.
Analyze this failed API execution context envelope:
${JSON.stringify(envelope, null, 2)}

Respond with a JSON object with this exact structure:
{
  "diagnosis": "Short 1-2 sentence description of root cause",
  "explanation": "Detailed explanation of which fields failed validation and why",
  "suggestedBodyPayload": { ...valid JSON object conforming to schema... }
}
`;

  if (settings.provider === 'gemini') {
    const key = settings.geminiKey || '';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  }

  if (settings.provider === 'ollama') {
    const baseUrl = settings.ollamaBaseUrl || 'http://localhost:11434';
    const model = settings.ollamaModel || 'llama3.2';
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false, format: 'json' })
    });
    const data = await res.json();
    return JSON.parse(data.response);
  }

  if (settings.provider === 'groq' || settings.provider === 'openai') {
    const isGroq = settings.provider === 'groq';
    const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const key = isGroq ? settings.groqKey : settings.openaiKey;
    const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    return JSON.parse(text);
  }

  throw new Error(`Unsupported AI provider: ${settings.provider}`);
}
```

---

## 2. Archived Feature: Client-Side History & v2.0 Cloud Sync / Payments Roadmap

### 2.1 Archived Client-Side History (`localHistoryStorage.ts`)
In v1.0, history was stored purely in `localStorage` without any cloud database or user login requirement:
```typescript
export interface HistoryItem {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  status: number;
  latencyMs: number;
  requestBody?: any;
  responsePreview?: string;
}

const STORAGE_KEY = 'backend_swagger_history_v1';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: HistoryItem): void {
  try {
    const current = getHistory();
    const updated = [item, ...current.slice(0, 49)]; // Store last 50 requests
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history', err);
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

---

### 2.2 v2.0 Roadmap: User Authentication, Cloud History & Subscriptions

#### Architecture & Impact Assessment
- **Does User Login Affect CORS or Proxying?**: No. The background service worker handles all request dispatching directly to `localhost` or remote servers. Auth tokens for cloud history sync are simply sent to the cloud backend (e.g. `api.backendswagger.dev`), completely separate from the target API being tested.
- **Maintenance / Subscriptions Database Schema (PostgreSQL)**:
  ```sql
  -- 1. Users Table
  CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      tier VARCHAR(50) DEFAULT 'free' -- 'free', 'pro', 'team'
  );

  -- 2. Subscriptions & Maintenance Table
  CREATE TABLE subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      status VARCHAR(50) NOT NULL, -- 'active', 'past_due', 'canceled'
      plan_name VARCHAR(100) NOT NULL, -- 'Pro Plan ($5/mo)'
      current_period_end TIMESTAMP WITH TIME ZONE,
      maintenance_mode BOOLEAN DEFAULT FALSE,
      last_payment_date TIMESTAMP WITH TIME ZONE
  );

  -- 3. Cloud History Table (Pro Tier)
  CREATE TABLE cloud_request_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      workspace_id VARCHAR(100),
      endpoint_path VARCHAR(500) NOT NULL,
      http_method VARCHAR(10) NOT NULL,
      request_headers JSONB,
      request_body JSONB,
      response_status INT,
      response_data JSONB,
      latency_ms INT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

---

## 3. How to Restore or Re-integrate in Future Updates

1. **To Restore AI Debugger**:
   - Copy the TypeScript files from Section 1.3 into `frontend/src/features/ai-debugger/`.
   - Add `AIDebuggerDrawer` to `App.tsx` and the AI Debugger button to `Header.tsx`.
   - Add the AI provider key inputs to `SettingsModal.tsx`.

2. **To Restore History**:
   - Copy `localHistoryStorage.ts` from Section 2.1 into `frontend/src/features/history/`.
   - Add `HistoryDrawer` to `App.tsx` and hook up `saveHistoryItem()` inside `httpRunner.ts`.

---
*Archived by Backend Swagger Engineering Team — Ready for v2.0 Expansion.*
