// lib/chatbot.ts
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = 'chatHistory';

// Récupère l'historique dans localStorage
export function getChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    if (!history) return [];
    return JSON.parse(history).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch {
    return [];
  }
}

// Sauvegarde l'historique dans localStorage
export function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// Envoie l'historique au backend Next.js via /api/chat
export async function sendChatMessage(history: ChatMessage[]): Promise<string> {
  const messages = history.map(m => ({ role: m.role, content: m.content }));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ history: messages }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur API: ${errText}`);
  }

  const data = await response.json();
  return data.content || 'Erreur : réponse vide de l’IA.';
}
