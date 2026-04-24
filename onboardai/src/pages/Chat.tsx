import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Paperclip, Bot, Verified, CheckCircle2, Circle, Clock, FileText, Sparkles, Settings, Trash2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendChatMessage, clearChatHistory, uploadDocument, getChatHistory } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: string[];
  sources?: { text: string; filename: string; chunk_id: string }[];
}

export default function Chat() {
  const [userId, setUserId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "Welcome back, Alex! I'm your onboarding assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; chunks: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [latestSources, setLatestSources] = useState<{ text: string; filename: string; chunk_id: string }[]>([]);

  // Initialize userId and fetch history
  useEffect(() => {
    let currentUserId = localStorage.getItem('onboardUserId');
    if (!currentUserId) {
      currentUserId = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('onboardUserId', currentUserId);
    }
    setUserId(currentUserId);

    getChatHistory(currentUserId)
      .then((data) => {
        if (data.history && data.history.length > 0) {
          const loadedMessages = data.history.map((msg: any, i: number) => {
            let text = msg.parts[0]?.text || '';
            // If user message has context block, extract just the actual question
            if (msg.role !== 'model' && text.includes('Question: ')) {
              text = text.split('Question: ').pop() || text;
            }
            return {
              id: `history-${i}`,
              role: msg.role === 'model' ? 'ai' : 'user',
              text: text.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          
          if (loadedMessages.length > 0) {
             setMessages(loadedMessages as Message[]);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(input, userId);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources
      };

      setMessages(prev => [...prev, aiMessage]);
      if (response.sources?.length) {
        setLatestSources(response.sources);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: `Sorry, something went wrong: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadDocument(file);
      setUploadedFiles(prev => [...prev, { name: result.filename, chunks: result.chunks_stored }]);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: `✅ ${result.filename} uploaded successfully! ${result.chunks_stored} chunks stored. You can now ask me questions about this document.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: `❌ Upload failed: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory(userId);
      setMessages([{
        id: '1',
        role: 'ai',
        text: "Conversation history cleared! How can I help you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setLatestSources([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-surface relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Central Chat Column */}
      <main className="flex-1 flex flex-col h-full border-r border-surface-container-highest">
        {/* Chat Canvas */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 scroll-smooth">
          <div className="max-w-[768px] mx-auto space-y-8 pb-10">
            <div className="flex justify-center">
              <span className="bg-surface-container text-on-surface-variant/60 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Today</span>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-primary-container rounded-lg flex items-center justify-center">
                        <Bot size={14} className="text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-on-surface-variant">OnboardAI</span>
                      <Verified size={12} className="text-accent" fill="currentColor" />
                    </div>
                  )}

                  <div className={msg.role === 'user' ? 'chat-bubble-user max-w-[75%]' : 'chat-bubble-ai max-w-[85%]'}>
                    <div className="text-[15px] leading-relaxed text-on-surface prose prose-sm max-w-none">
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-surface-container">
                        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, i) => (
                            <span key={i} title={source.text} className="px-2 py-1 bg-accent/10 text-accent text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-help">
                              <FileText size={10} />
                              {source.filename}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {msg.actions && (
                      <div className="mt-4 space-y-2">
                        <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container">
                          <p className="text-[11px] font-bold text-on-primary-container mb-2 uppercase tracking-wide">Priority Actions:</p>
                          <ul className="space-y-2">
                            {msg.actions.map((action, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                                {i === 0 ? <CheckCircle2 size={16} className="text-secondary" /> : <Circle size={16} className="text-on-surface-variant/20" />}
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-3 opacity-40">
                      <Clock size={10} />
                      <span className="text-[10px] font-bold">{msg.timestamp}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-container rounded-lg flex items-center justify-center animate-pulse">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <footer className="p-6 bg-white border-t border-surface-container-highest">
          <div className="max-w-[768px] mx-auto bg-surface-container-low rounded-2xl border border-surface-container p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2.5 text-on-surface-variant hover:text-accent hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              title="Upload PDF or DOCX"
            >
              {isUploading ? <Upload size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about policies, benefits, or tasks..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2 outline-none"
            />
            <div className="flex items-center gap-1 pr-1">
              <button
                onClick={handleClearHistory}
                className="p-2.5 text-on-surface-variant hover:text-red-500 transition-colors"
                title="Clear chat history"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-primary text-white p-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                <Send size={20} fill="currentColor" />
              </button>
            </div>
          </div>
          <p className="text-center text-[9px] text-on-surface-variant/40 mt-4 font-bold uppercase tracking-[0.2em]">RAG-Powered AI Assistant · Grounded in your documents</p>
        </footer>
      </main>

      {/* Right Knowledge Panel */}
      <aside className="w-80 bg-surface-container-low h-full flex flex-col border-l border-surface-container-highest overflow-y-auto hidden xl:flex">
        <div className="p-6">
          <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-8">AI Knowledge Context</h3>
          
          <div className="space-y-8">
            {/* Uploaded Files */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold">Uploaded Documents</span>
                <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">{uploadedFiles.length} files</span>
              </div>
              <div className="space-y-2">
                {uploadedFiles.length === 0 ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-surface-container-highest rounded-xl text-xs text-on-surface-variant hover:border-accent hover:text-accent transition-all"
                  >
                    <Upload size={16} />
                    Upload PDF / DOCX to get started
                  </button>
                ) : (
                  uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-container shadow-sm">
                      <FileText size={18} className="text-red-500" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{f.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{f.chunks} chunks indexed</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Latest Sources from RAG */}
            {latestSources.length > 0 && (
              <div className="bg-primary-container/5 p-4 rounded-xl border border-primary-container/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-accent" />
                  <span className="text-[11px] font-black text-accent uppercase">Retrieved Sources</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {latestSources.slice(0, 3).map((src, i) => (
                    <div key={i} className="text-xs leading-relaxed text-on-surface-variant bg-white p-2 rounded-lg border border-surface-container">
                      <p className="font-bold text-on-surface text-[10px] mb-1">{src.filename}</p>
                      <p className="line-clamp-3">{src.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-auto p-6 bg-surface-container">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-surface-container rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <Settings size={14} />
            Manage Knowledge Base
          </button>
        </div>
      </aside>
    </div>
  );
}
