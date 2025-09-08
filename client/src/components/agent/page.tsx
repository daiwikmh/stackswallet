"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Loader2, MessageSquare, Zap, Users, ChevronDown } from "lucide-react";
import { agentService } from "./agent-service";
import ReactMarkdown from "react-markdown";
import ErrorBoundary from "./ErrorBoundary";
import { AgentProvider, useAgent } from "./manual/AgentContext";

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
  return (
    <AgentProvider walletAddress={walletAddress} isWalletConnected={isWalletConnected}>
      <AgentChatInterface walletAddress={walletAddress} isWalletConnected={isWalletConnected} />
    </AgentProvider>
  );
}

function AgentChatInterface({ walletAddress, isWalletConnected }: AgentPageProps) {
  const { 
    agents, 
    activeAgent, 
    selectAgent, 
    getAgentConversation, 
    sendMessageToAgent, 
    isAgentResponding 
  } = useAgent();
  
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const conversation = activeAgent ? getAgentConversation(activeAgent.id) : undefined;

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
    
    if (!activeAgent) {
      alert("Please select an agent to chat with from the Manual Control section first.");
      return;
    }

    const message = input.trim();
    setInput("");

    try {
      await sendMessageToAgent(activeAgent.id, message);
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

  const capabilities = [
    { icon: <Zap className="w-4 h-4" />, label: "Multi-Sig Operations", desc: "Create and manage multi-signature wallets" },
    { icon: <Bot className="w-4 h-4" />, label: "Delegation Management", desc: "Set up and control AI agents" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Smart Contracts", desc: "Interact with Stacks blockchain" },
  ];

  const agentOptions = agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    address: agent.address,
    isActive: activeAgent?.id === agent.id
  }));

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
              <h1 className="text-xl font-bold text-white">
                {activeAgent ? `Chat with ${activeAgent.name}` : "AI Agent Assistant"}
              </h1>
              <p className="text-sm text-neutral-400">
                {activeAgent 
                  ? `Autonomous agent: ${activeAgent.address.slice(0, 8)}...${activeAgent.address.slice(-4)}`
                  : "Select an agent from Manual Control to start chatting"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isWalletConnected ? "default" : "secondary"} className="bg-orange-500/20 text-orange-500">
              {isWalletConnected ? "Connected" : "Disconnected"}
            </Badge>
            {activeAgent && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-500">
                {activeAgent.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Capabilities Sidebar */}
        <div className="w-80 border-r border-neutral-800 p-6 space-y-4">
          {/* Agent Selection */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3">
              Select Agent
            </h3>
            {agentOptions.length === 0 ? (
              <Card className="bg-neutral-900/50 border-neutral-700">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">No agents available</p>
                  <p className="text-xs text-neutral-500 mt-1">Create agents in Manual Control</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {agentOptions.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      agent.isActive
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-neutral-900/50 border-neutral-700 text-neutral-300 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs opacity-70">
                          {agent.address.slice(0, 8)}...{agent.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3">
              Agent Capabilities
            </h3>
            <div className="space-y-3">
              {capabilities.map((capability, index) => (
                <Card key={index} className="bg-neutral-900/50 border-neutral-700">
                  <CardContent className="p-3">
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
          <div className="relative flex-1">
            <ScrollArea 
              className="h-full p-6 scroll-smooth chat-scroll [&>[data-radix-scroll-area-viewport]]:scroll-smooth" 
              ref={scrollAreaRef}
              onScrollCapture={handleScroll}
            >
            <style jsx global>{`
              /* Custom scrollbar for chat area */
              [data-radix-scroll-area-scrollbar][data-orientation="vertical"] {
                width: 8px;
                background: rgba(64, 64, 64, 0.3);
                border-radius: 4px;
                margin: 4px;
              }
              
              [data-radix-scroll-area-scrollbar][data-orientation="vertical"] [data-radix-scroll-area-thumb] {
                background: linear-gradient(to bottom, #f97316, #ea580c);
                border-radius: 4px;
                transition: all 0.2s ease;
              }
              
              [data-radix-scroll-area-scrollbar][data-orientation="vertical"] [data-radix-scroll-area-thumb]:hover {
                background: linear-gradient(to bottom, #fb923c, #f97316);
                width: 10px;
              }
              
              [data-radix-scroll-area-scrollbar][data-orientation="vertical"]:hover {
                width: 10px;
                background: rgba(64, 64, 64, 0.4);
              }
              
              /* Smooth scrolling animation */
              [data-radix-scroll-area-viewport] {
                scroll-behavior: smooth;
              }
              
              /* Custom scrollbar for webkit browsers as fallback */
              .chat-scroll::-webkit-scrollbar {
                width: 8px;
              }
              
              .chat-scroll::-webkit-scrollbar-track {
                background: rgba(64, 64, 64, 0.3);
                border-radius: 4px;
              }
              
              .chat-scroll::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #f97316, #ea580c);
                border-radius: 4px;
                transition: all 0.2s ease;
              }
              
              .chat-scroll::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #fb923c, #f97316);
              }
            `}</style>
            <div className="space-y-4 max-w-4xl mx-auto">
              {!activeAgent ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2">
                    Select an Agent to Start Chatting
                  </h3>
                  <p className="text-neutral-500 max-w-md mx-auto">
                    Choose an agent from the sidebar or create a new one in Manual Control to begin conversing.
                  </p>
                </div>
              ) : !conversation || conversation.messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2">
                    Start a conversation with {activeAgent.name}
                  </h3>
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
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                        <Bot className="w-4 h-4 text-orange-400" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl shadow-lg border ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400/30 shadow-orange-500/20"
                        : "bg-gradient-to-br from-neutral-800 to-neutral-900 text-white border-neutral-600/50 shadow-neutral-900/50"
                    }`}
                  >
                    <div className="p-4">
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-600/30">
                          <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                            {activeAgent?.name || "AI Agent"}
                          </div>
                          <div className="w-1 h-1 bg-orange-500/60 rounded-full"></div>
                          <div className="text-xs text-neutral-400 font-mono">
                            {activeAgent?.address.slice(0, 8)}...{activeAgent?.address.slice(-4)}
                          </div>
                          {message.isStreaming && (
                            <div className="flex items-center gap-1 ml-auto">
                              <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
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
                                  <span className="text-orange-300 italic">Thinking...</span>
                                ))}
                                {message.isStreaming && message.content && (
                                  <span className="inline-block w-0.5 h-4 bg-orange-400 ml-1 animate-pulse" />
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
                          ? "border-orange-400/20 text-orange-200/70" 
                          : "border-neutral-600/30 text-neutral-400"
                      }`}>
                        <div className="flex items-center gap-1">
                          {message.role === "user" ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                          <span className="text-xs">
                            {message.role === "user" ? "You" : activeAgent?.name}
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
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border border-orange-400/50">
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
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transition-all transform hover:scale-110 z-10"
              size="icon"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          )}
        </div>

          {/* Input */}
          <div className="border-t border-neutral-800/50 bg-gradient-to-r from-neutral-900 to-neutral-950 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={activeAgent ? `Ask ${activeAgent.name} about multi-sig operations, delegation, or expenses...` : "Select an agent to start chatting..."}
                    className="w-full bg-neutral-800/80 border border-neutral-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 pr-12 shadow-lg backdrop-blur-sm transition-all"
                    disabled={isAgentResponding || !activeAgent}
                  />
                  {activeAgent && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                      <div className="text-xs text-neutral-400 font-mono">
                        {activeAgent.address.slice(0, 6)}...
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isAgentResponding || !activeAgent}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
                >
                  {isAgentResponding ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span className="text-sm font-medium">Send</span>
                    </div>
                  )}
                </Button>
              </div>
              
              {/* Typing indicator when agent is responding */}
              {isAgentResponding && activeAgent && (
                <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                  </div>
                  <span>{activeAgent.name} is analyzing your request...</span>
                </div>
              )}
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
          <div className="text-white whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        ) : (
          isStreaming && <span className="text-orange-300 italic">Thinking...</span>
        )}
        {isStreaming && content && (
          <span className="inline-block w-0.5 h-4 bg-orange-400 ml-1 animate-pulse" />
        )}
      </>
    );
  }

  try {
    return (
      <>
        <ReactMarkdown
          className="text-white leading-relaxed"
          components={{
            // Enhanced styling for markdown elements
            h1: ({ children, ...props }) => (
              <h1 className="text-xl font-bold text-orange-200 mb-4 pb-2 border-b border-orange-500/30" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-lg font-semibold text-orange-300 mb-3 mt-4" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-base font-medium text-orange-400 mb-2 mt-3" {...props}>
                {children}
              </h3>
            ),
            p: ({ children, ...props }) => (
              <p className="text-white mb-3 leading-relaxed" {...props}>
                {children}
              </p>
            ),
            code: ({ children, className, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return (
                <code 
                  className="bg-neutral-700/80 px-2 py-1 rounded-md text-orange-300 font-mono text-sm border border-neutral-600/50" 
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }) => (
              <pre className="bg-neutral-700/80 border border-neutral-600/50 p-4 rounded-xl overflow-x-auto text-orange-300 font-mono text-sm mb-4 shadow-inner" {...props}>
                {children}
              </pre>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-none text-white mb-3 space-y-2" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside text-white mb-3 space-y-2 ml-4" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-white flex items-start gap-2" {...props}>
                <span className="text-orange-400 mt-2 flex-shrink-0">•</span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children, ...props }) => (
              <strong className="font-semibold text-orange-300" {...props}>
                {children}
              </strong>
            ),
            em: ({ children, ...props }) => (
              <em className="italic text-neutral-300" {...props}>
                {children}
              </em>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-orange-500/50 bg-orange-500/5 pl-4 py-2 my-3 rounded-r-lg text-neutral-300 italic" {...props}>
                {children}
              </blockquote>
            ),
            a: ({ children, href, ...props }) => (
              <a 
                href={href} 
                className="text-orange-400 hover:text-orange-300 underline decoration-orange-500/50 hover:decoration-orange-300 transition-colors" 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-neutral-600/50 rounded-lg" {...props}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children, ...props }) => (
              <thead className="bg-neutral-700/50" {...props}>
                {children}
              </thead>
            ),
            th: ({ children, ...props }) => (
              <th className="px-4 py-2 text-left text-orange-300 font-medium border-b border-neutral-600/50" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="px-4 py-2 text-white border-b border-neutral-600/30" {...props}>
                {children}
              </td>
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
          <span className="inline-block w-0.5 h-4 bg-orange-400 ml-1 animate-pulse" />
        )}
      </>
    );
  } catch (error) {
    console.error('ReactMarkdown render error:', error);
    setHasError(true);
    return (
      <>
        <div className="text-white whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
        {isStreaming && content && (
          <span className="inline-block w-0.5 h-4 bg-orange-400 ml-1 animate-pulse" />
        )}
      </>
    );
  }
}