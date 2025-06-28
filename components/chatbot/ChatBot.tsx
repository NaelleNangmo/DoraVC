'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2, RotateCcw, Sparkles, Zap } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const history = getChatHistory();
    if (history.length === 0) {
      // Message de bienvenue
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour ${user?.name || 'cher voyageur'} ! 👋\n\nJe suis DORA, votre assistant virtuel spécialisé dans les démarches de visa et les voyages.\n\n**Comment puis-je vous aider aujourd'hui ?**\n\n• 📋 Questions sur les procédures de visa\n• 📄 Aide avec les documents requis\n• 🌍 Informations sur les destinations\n• ⏰ Délais de traitement\n• 💰 Coûts et frais\n\nN'hésitez pas à me poser vos questions !`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } else {
      setMessages(history);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(inputValue);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.",
        timestamp: new Date(),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
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
    localStorage.removeItem('chatHistory');
  };

  const formatMessage = (content: string) => {
    // Formatage basique du markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n')
      .map((line, index) => (
        <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      ));
  };

  return (
    <>
      {/* Enhanced Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotateY: 10 }}
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 border-4 border-white dark:border-gray-800 relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
            </motion.div>
          </Button>
          
          {/* Notification badge */}
          {!isOpen && messages.length > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {messages.filter(m => m.role === 'assistant').length}
              </motion.span>
            </motion.div>
          )}

          {/* Floating particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.3, rotateY: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotateY: 0,
              height: isMinimized ? 60 : 500
            }}
            exit={{ opacity: 0, y: 100, scale: 0.3, rotateY: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-background/95 dark:bg-background/95 border rounded-2xl shadow-2xl overflow-hidden glass-effect preserve-3d"
          >
            {/* Enhanced Header */}
            <motion.div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              
              <div className="flex items-center space-x-3 relative z-10">
                <motion.div 
                  className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Bot className="h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    Assistant DORA
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-2"
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  </h3>
                  <div className="flex items-center space-x-1">
                    <motion.div 
                      className="h-2 w-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <p className="text-xs opacity-90">En ligne • IA spécialisée</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    title="Effacer la conversation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Messages */}
            {!isMinimized && (
              <>
                <ScrollArea className="h-80 p-4 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-900/50">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.8 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className={`flex items-start space-x-3 ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotateY: 15 }}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className={`text-sm font-bold ${
                                message.role === 'user' 
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                              }`}>
                                {message.role === 'user' ? (
                                  user?.name?.charAt(0).toUpperCase() || 'U'
                                ) : (
                                  <Bot className="h-4 w-4" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <motion.div
                            className={`max-w-[75%] rounded-2xl p-3 shadow-lg relative overflow-hidden ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                                : 'bg-white dark:bg-gray-800 border border-border/50 glass-effect'
                            }`}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            {message.role === 'assistant' && (
                              <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              />
                            )}
                            
                            <div className={`text-sm leading-relaxed ${
                              message.role === 'user' ? 'text-white' : 'text-foreground'
                            }`}>
                              {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                            </div>
                            <motion.p 
                              className={`text-xs mt-2 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              {message.timestamp.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </motion.p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <motion.div 
                          className="bg-white dark:bg-gray-800 border border-border/50 rounded-2xl p-3 shadow-lg glass-effect"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div 
                                key={i}
                                className="h-2 w-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                animate={{ 
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ 
                                  duration: 1, 
                                  repeat: Infinity, 
                                  delay: i * 0.2 
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Enhanced Input */}
                <motion.div 
                  className="p-4 border-t bg-background/80 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex space-x-2">
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Input
                        placeholder="Posez votre question..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="rounded-full border-border/50 focus:border-blue-500 focus:ring-blue-500 glass-effect"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        size="sm"
                        className="rounded-full h-10 w-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        <motion.div
                          animate={{ rotate: isLoading ? 360 : 0 }}
                          transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                        >
                          {isLoading ? <Zap className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-2 text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Appuyez sur Entrée pour envoyer • IA spécialisée en voyages
                  </motion.p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}