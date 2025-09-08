"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Loader2, MessageSquare, Zap } from "lucide-react";
import { agentService } from "./agent-service";
import ReactMarkdown from "react-markdown";
import ErrorBoundary from "./ErrorBoundary";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AgentPageProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
}

export default function AgentPage({ walletAddress, isWalletConnected }: AgentPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `assistant_${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await agentService.streamResponse(
        input.trim(),
        sessionId,
        (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        },
        () => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, isStreaming: false }
              : msg
          ));
          setIsLoading(false);
        },
        (error: Error) => {
          console.error("Agent error:", error);
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { 
                  ...msg, 
                  content: "Sorry, I encountered an error. Please try again.", 
                  isStreaming: false 
                }
              : msg
          ));
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.slice(0, -1)); // Remove the assistant message
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const capabilities = [
    { icon: <Zap className="w-4 h-4" />, label: "Multi-Sig Operations", desc: "Create and manage multi-signature wallets" },
    { icon: <Bot className="w-4 h-4" />, label: "Delegation Management", desc: "Set up and control AI agents" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Smart Contracts", desc: "Interact with Stacks blockchain" },
  ];

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Agent Assistant</h1>
              <p className="text-sm text-neutral-400">
                Interact with your multi-sig wallet and delegation system
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isWalletConnected ? "default" : "secondary"} className="bg-orange-500/20 text-orange-500">
              {isWalletConnected ? "Connected" : "Disconnected"}
            </Badge>
            {walletAddress && (
              <Badge variant="outline" className="font-mono text-xs">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Capabilities Sidebar */}
        <div className="w-80 border-r border-neutral-800 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
            Capabilities
          </h3>
          <div className="space-y-3">
            {capabilities.map((capability, index) => (
              <Card key={index} className="bg-neutral-900/50 border-neutral-700 hover:border-orange-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-500 mt-0.5">
                      {capability.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        {capability.label}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {capability.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isWalletConnected && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="text-amber-400 text-sm">
                  <strong>Note:</strong> Connect your wallet to enable full agent capabilities.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2">
                    Welcome to AI Agent Assistant
                  </h3>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    I can help you with multi-sig operations, delegation management, and interacting with your Stacks contracts. 
                    What would you like to do?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-neutral-800 text-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        {message.role === "user" ? (
                          <User className="w-4 h-4 mt-0.5" />
                        ) : (
                          <Bot className="w-4 h-4 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="prose prose-invert prose-sm max-w-none">
                          {message.role === "assistant" ? (
                            <ErrorBoundary 
                              fallback={
                                <div className="text-white whitespace-pre-wrap">
                                  {message.content || (message.isStreaming && "Thinking...")}
                                  {message.isStreaming && message.content && (
                                    <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
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
                            // User messages don't need markdown
                            <div className="text-white">
                              {message.content}
                            </div>
                          )}
                        </div>
                        <div className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-neutral-800 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about multi-sig operations, delegation, or smart contracts..."
                  className="flex-1 bg-neutral-800 border-neutral-700 focus:border-orange-500 text-white placeholder:text-neutral-400"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Safe Markdown Renderer with Error Boundary
interface SafeMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

function SafeMarkdownRenderer({ content, isStreaming }: SafeMarkdownProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when content changes
  useEffect(() => {
    setHasError(false);
  }, [content]);

  // Fallback if markdown fails
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
            // Custom styling for markdown elements
            h1: ({ children, ...props }) => <h1 className="text-xl font-bold text-white mb-3" {...props}>{children}</h1>,
            h2: ({ children, ...props }) => <h2 className="text-lg font-semibold text-white mb-2" {...props}>{children}</h2>,
            h3: ({ children, ...props }) => <h3 className="text-base font-medium text-white mb-2" {...props}>{children}</h3>,
            p: ({ children, ...props }) => <p className="text-white mb-2 leading-relaxed" {...props}>{children}</p>,
            code: ({ children, className, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return (
                <code 
                  className="bg-neutral-700 px-2 py-1 rounded text-orange-300 font-mono text-sm" 
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }) => (
              <pre className="bg-neutral-700 p-4 rounded-lg overflow-x-auto text-orange-300 font-mono text-sm mb-3" {...props}>
                {children}
              </pre>
            ),
            ul: ({ children, ...props }) => <ul className="list-disc list-inside text-white mb-2 space-y-1" {...props}>{children}</ul>,
            ol: ({ children, ...props }) => <ol className="list-decimal list-inside text-white mb-2 space-y-1" {...props}>{children}</ol>,
            li: ({ children, ...props }) => <li className="text-white" {...props}>{children}</li>,
            strong: ({ children, ...props }) => <strong className="font-semibold text-orange-300" {...props}>{children}</strong>,
            em: ({ children, ...props }) => <em className="italic text-neutral-300" {...props}>{children}</em>,
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-orange-500 pl-4 text-neutral-300 italic mb-3" {...props}>
                {children}
              </blockquote>
            ),
            a: ({ children, href, ...props }) => (
              <a 
                href={href} 
                className="text-orange-400 hover:text-orange-300 underline" 
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