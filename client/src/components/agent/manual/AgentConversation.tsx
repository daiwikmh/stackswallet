import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Loader2, MessageSquare, Trash2, ChevronDown } from 'lucide-react';
import { useAgent } from './AgentContext';
import ReactMarkdown from 'react-markdown';
import ErrorBoundary from '../ErrorBoundary';

interface AgentConversationProps {
  agentId: string;
}

export default function AgentConversation({ agentId }: AgentConversationProps) {
  const { 
    agents, 
    getAgentConversation, 
    sendMessageToAgent, 
    clearAgentConversation,
    isAgentResponding 
  } = useAgent();
  
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agents.find(a => a.id === agentId);
  const conversation = getAgentConversation(agentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Monitor scroll position to show/hide scroll-to-bottom button
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom && conversation && conversation.messages.length > 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isAgentResponding) return;

    const message = input.trim();
    setInput("");

    try {
      await sendMessageToAgent(agentId, message);
    } catch (error) {
      console.error("Failed to send message to agent:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearConversation = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      clearAgentConversation(agentId);
    }
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-neutral-400">
          <Bot className="w-12 h-12 mx-auto mb-4" />
          <p>Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950 rounded-lg border border-neutral-700">
      {/* Header */}
      <div className="border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
              <p className="text-sm text-neutral-400">
                Autonomous AI Agent • {agent.address.slice(0, 8)}...{agent.address.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {conversation?.messages.length || 0} messages
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearConversation}
              disabled={!conversation || conversation.messages.length === 0}
              className="text-neutral-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1">
        <ScrollArea 
          className="h-full p-4 scroll-smooth chat-scroll [&>[data-radix-scroll-area-viewport]]:scroll-smooth" 
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          <style jsx global>{`
            /* Custom scrollbar for manual agent chat */
            [data-radix-scroll-area-scrollbar][data-orientation="vertical"] {
              width: 8px;
              background: rgba(59, 130, 246, 0.2);
              border-radius: 4px;
              margin: 4px;
            }
            
            [data-radix-scroll-area-scrollbar][data-orientation="vertical"] [data-radix-scroll-area-thumb] {
              background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
              border-radius: 4px;
              transition: all 0.2s ease;
            }
            
            [data-radix-scroll-area-scrollbar][data-orientation="vertical"] [data-radix-scroll-area-thumb]:hover {
              background: linear-gradient(to bottom, #60a5fa, #3b82f6);
              width: 10px;
            }
            
            [data-radix-scroll-area-scrollbar][data-orientation="vertical"]:hover {
              width: 10px;
              background: rgba(59, 130, 246, 0.3);
            }
          `}</style>
        <div className="space-y-4">
          {!conversation || conversation.messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-neutral-300 mb-2">
                Start a conversation with {agent.name}
              </h4>
              <p className="text-neutral-500 max-w-md mx-auto">
                This agent has access to multi-sig operations, delegation management, and expense sharing. 
                Ask questions or give commands to get started.
              </p>
            </div>
          ) : (
            conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-6`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-2xl shadow-lg border ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-blue-500/20"
                      : "bg-gradient-to-br from-neutral-800 to-neutral-900 text-white border-neutral-600/50 shadow-neutral-900/50"
                  }`}
                >
                  <div className="p-4">
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-600/30">
                        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                          {agent?.name || "AI Agent"}
                        </div>
                        <div className="w-1 h-1 bg-blue-500/60 rounded-full"></div>
                        <div className="text-xs text-neutral-400 font-mono">
                          {agent?.address.slice(0, 8)}...{agent?.address.slice(-4)}
                        </div>
                        {message.isStreaming && (
                          <div className="flex items-center gap-1 ml-auto">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="prose prose-invert prose-sm max-w-none">
                      {message.role === "assistant" ? (
                        <ErrorBoundary 
                          fallback={
                            <div className="text-white whitespace-pre-wrap leading-relaxed">
                              {message.content || (message.isStreaming && (
                                <span className="text-blue-300 italic">Thinking...</span>
                              ))}
                              {message.isStreaming && message.content && (
                                <span className="inline-block w-0.5 h-4 bg-blue-400 ml-1 animate-pulse" />
                              )}
                            </div>
                          }
                        >
                          <SafeMarkdownRenderer 
                            content={message.content} 
                            isStreaming={message.isStreaming} 
                          />
                        </ErrorBoundary>
                      ) : (
                        <div className="text-white leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-xs mt-3 pt-2 border-t flex items-center gap-2 ${
                      message.role === "user" 
                        ? "border-blue-400/20 text-blue-200/70" 
                        : "border-neutral-600/30 text-neutral-400"
                    }`}>
                      <div className="flex items-center gap-1">
                        {message.role === "user" ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                        <span className="text-xs">
                          {message.role === "user" ? "You" : agent?.name}
                        </span>
                      </div>
                      <div className="w-0.5 h-0.5 rounded-full bg-current opacity-50"></div>
                      <div className="font-mono text-xs">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border border-blue-400/50">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all transform hover:scale-110 z-10"
          size="icon"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}
    </div>

      {/* Input */}
      <div className="border-t border-neutral-700 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Send a message to ${agent.name}...`}
            className="flex-1 bg-neutral-800 border-neutral-600 focus:border-blue-500 text-white placeholder:text-neutral-400"
            disabled={isAgentResponding}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isAgentResponding}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isAgentResponding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Safe Markdown Renderer (reused from main agent page)
interface SafeMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

function SafeMarkdownRenderer({ content, isStreaming }: SafeMarkdownProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [content]);

  if (hasError || !content) {
    return (
      <>
        {content ? (
          <div className="text-white whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          isStreaming && <span className="opacity-50 text-white">Thinking...</span>
        )}
        {isStreaming && content && (
          <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
        )}
      </>
    );
  }

  try {
    return (
      <>
        <ReactMarkdown
          className="text-white"
          components={{
            h1: ({ children, ...props }) => <h1 className="text-xl font-bold text-white mb-3" {...props}>{children}</h1>,
            h2: ({ children, ...props }) => <h2 className="text-lg font-semibold text-white mb-2" {...props}>{children}</h2>,
            h3: ({ children, ...props }) => <h3 className="text-base font-medium text-white mb-2" {...props}>{children}</h3>,
            p: ({ children, ...props }) => <p className="text-white mb-2 leading-relaxed" {...props}>{children}</p>,
            code: ({ children, ...props }) => (
              <code className="bg-neutral-600 px-2 py-1 rounded text-blue-300 font-mono text-sm" {...props}>
                {children}
              </code>
            ),
            pre: ({ children, ...props }) => (
              <pre className="bg-neutral-600 p-4 rounded-lg overflow-x-auto text-blue-300 font-mono text-sm mb-3" {...props}>
                {children}
              </pre>
            ),
            ul: ({ children, ...props }) => <ul className="list-disc list-inside text-white mb-2 space-y-1" {...props}>{children}</ul>,
            ol: ({ children, ...props }) => <ol className="list-decimal list-inside text-white mb-2 space-y-1" {...props}>{children}</ol>,
            li: ({ children, ...props }) => <li className="text-white" {...props}>{children}</li>,
            strong: ({ children, ...props }) => <strong className="font-semibold text-blue-300" {...props}>{children}</strong>,
            em: ({ children, ...props }) => <em className="italic text-neutral-300" {...props}>{children}</em>,
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 text-neutral-300 italic mb-3" {...props}>
                {children}
              </blockquote>
            ),
            a: ({ children, href, ...props }) => (
              <a 
                href={href} 
                className="text-blue-400 hover:text-blue-300 underline" 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
          }}
          onError={(error) => {
            console.error('ReactMarkdown error:', error);
            setHasError(true);
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && content && (
          <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
        )}
      </>
    );
  } catch (error) {
    console.error('ReactMarkdown render error:', error);
    setHasError(true);
    return (
      <>
        <div className="text-white whitespace-pre-wrap">
          {content}
        </div>
        {isStreaming && content && (
          <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
        )}
      </>
    );
  }
}