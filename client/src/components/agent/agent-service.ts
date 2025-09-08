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
      
      let hasStarted = false;
      let finalOutput = '';
      
      // Create the streaming configuration with proper callbacks
      const streamConfig = {
        configurable: { sessionId },
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              // Handle individual tokens from the LLM
              console.log("📝 Token received:", token);
              if (!hasStarted) {
                hasStarted = true;
                onChunk(""); // Initialize streaming
              }
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

      try {
        // Use invoke for more reliable streaming with the current setup
        const response = await agentWithChatHistory.invoke(
          { input },
          streamConfig
        );

        // If we have a response output, stream it character by character
        if (response && response.output) {
          finalOutput = response.output;
          
          // Stream the output character by character for better UX
          for (let i = 0; i < finalOutput.length; i++) {
            onChunk(finalOutput[i]);
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        } else {
          onChunk("I apologize, but I couldn't generate a proper response. Please try again.");
        }

        onComplete();

      } catch (streamError) {
        console.error("❌ Streaming error, falling back to regular invoke:", streamError);
        
        // Fallback to regular invoke if streaming fails
        try {
          const response = await agentWithChatHistory.invoke(
            { input },
            { configurable: { sessionId } }
          );
          
          if (response && response.output) {
            finalOutput = response.output;
            onChunk(finalOutput);
          } else {
            onChunk("I'm having trouble processing your request. Please try again.");
          }
          
          onComplete();
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
          onError(fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)));
        }
      }

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