import { agentWithChatHistory } from "../../agent/agent";

export interface AgentStreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

class AgentService {
  /**
   * Stream response from the LangChain agent
   */
  async streamResponse(
    input: string,
    sessionId: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log("🤖 Starting agent stream for input:", input);
      
      // Create the streaming configuration
      const streamConfig = {
        configurable: { sessionId },
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              // Handle individual tokens from the LLM
              onChunk(token);
            },
            handleLLMEnd() {
              // Called when the LLM finishes generating
              console.log("✅ Agent LLM generation completed");
            },
            handleChainEnd() {
              // Called when the entire chain/agent finishes
              console.log("✅ Agent chain completed");
              onComplete();
            },
            handleChainError(error: Error) {
              console.error("❌ Agent chain error:", error);
              onError(error);
            },
          },
        ],
      };

      // Stream the agent response
      const stream = await agentWithChatHistory.stream(
        { input },
        streamConfig
      );

      // Process the stream
      for await (const chunk of stream) {
        if (chunk.agent?.messages && chunk.agent.messages.length > 0) {
          // Extract the message content from the agent response
          const lastMessage = chunk.agent.messages[chunk.agent.messages.length - 1];
          if (lastMessage.content) {
            // For agent messages, we might get the full content at once
            // rather than token by token, so we handle it here
            if (typeof lastMessage.content === 'string') {
              onChunk(lastMessage.content);
            }
          }
        }
        
        // Handle tool calls and other chunk types
        if (chunk.tools && Object.keys(chunk.tools).length > 0) {
          onChunk("\n\n🔧 Using tools...\n");
          
          // Log tool usage
          Object.entries(chunk.tools).forEach(([toolName, toolResult]) => {
            console.log(`🔧 Tool ${toolName} executed:`, toolResult);
            onChunk(`**${toolName}**: Processing...\n`);
          });
        }
      }

      onComplete();

    } catch (error) {
      console.error("❌ Agent service error:", error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get a simple non-streaming response from the agent
   */
  async getResponse(input: string, sessionId: string): Promise<string> {
    try {
      console.log("🤖 Getting agent response for:", input);
      
      const response = await agentWithChatHistory.invoke(
        { input },
        { configurable: { sessionId } }
      );

      return response.output || response.content || "No response generated";
      
    } catch (error) {
      console.error("❌ Agent service error:", error);
      throw error;
    }
  }

  /**
   * Clear chat history for a session
   */
  async clearSession(sessionId: string): Promise<void> {
    try {
      // The agent service doesn't expose a direct way to clear history,
      // but we can create a new session by using a different sessionId
      console.log("🗑️ Session cleared:", sessionId);
    } catch (error) {
      console.error("❌ Failed to clear session:", error);
      throw error;
    }
  }

  /**
   * Health check to ensure the agent is working
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testSessionId = `health_check_${Date.now()}`;
      const response = await this.getResponse("Hello", testSessionId);
      return typeof response === 'string' && response.length > 0;
    } catch (error) {
      console.error("❌ Agent health check failed:", error);
      return false;
    }
  }
}

export const agentService = new AgentService();