'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X, Bot, RotateCcw, Minimize2, Maximize2, Copy, Trash2, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage, sendChatMessage, getChatHistory, saveChatHistory } from '@/lib/chatbot';
import { useAuth } from '@/hooks/use-auth';


export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const history = getChatHistory();
      if (history.length === 0) {
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `👋 Bonjour ${user?.name || 'cher voyageur'} !\n\nJe suis DORA, votre assistant virtuel spécialisé dans les démarches administratives, les voyages, les emplois, les études et bien plus.\nPosez-moi vos questions !`,
          timestamp: new Date(),
        };
        setMessages([welcome]);
        saveChatHistory([welcome]);
      } else {
        setMessages(history);
      }
      setError(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  const typeText = (text: string, callback: () => void) => {
    let index = 0;
    const speed = 20; // ms/char

    const typing = () => {
      if (index < text.length) {
        setTypingMessage(prev => prev + text.charAt(index));
        index++;
        setTimeout(typing, speed);
      } else {
        callback();
      }
    };

    setTypingMessage('');
    typing();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendChatMessage(updatedMessages);

      typeText(responseText, () => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
        setIsLoading(false);
      });
    } catch (err) {
      setError('Erreur lors de la communication avec le serveur. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    saveChatHistory([]);
    setError(null);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setError(null);
  };

  const deleteMessage = (id: string) => {
    const filtered = messages.filter(m => m.id !== id);
    setMessages(filtered);
    saveChatHistory(filtered);
    setError(null);
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n')
      .map((line, idx) =>
        line.trim() === '' ? (
          <div key={idx} className="h-2" />
        ) : (
          <div key={idx} dangerouslySetInnerHTML={{ __html: line }} />
        )
      );
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          title={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-96 bg-white border rounded-lg shadow-xl transition-all duration-200 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Assistant DORA</h3>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full" />
                  <p className="text-xs opacity-90">En ligne • IA spécialisée</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearChat} className="text-white hover:bg-white/20 h-8 w-8 p-0" title="Effacer la conversation">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20 h-8 w-8 p-0" title={isMinimized ? 'Agrandir' : 'Réduire'}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8 p-0" title="Fermer">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <ScrollArea className="h-80 p-4">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-sm">{error}</div>}
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className={`group flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={`text-sm font-bold ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                          {message.role === 'user' ? user?.name?.charAt(0).toUpperCase() || 'U' : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`relative max-w-[75%] rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <div className="text-sm leading-relaxed">
                          {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                        </div>
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)} title="Copier">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMessage(message.id)} title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {typingMessage && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[75%] text-sm leading-relaxed whitespace-pre-line">
                        {typingMessage}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex items-center space-x-2">
                <Input
                  placeholder="Posez votre question..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0 text-white"
                  title="Envoyer"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
