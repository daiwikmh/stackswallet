import { initAgent } from "../../agent/agent"; // import your initAgent factory

export interface AgentStreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

class AgentService {
private agentWithChatHistoryPromise: ReturnType<typeof initAgent> | null = null;

  private async getAgent() {
    if (!this.agentWithChatHistoryPromise) {
      this.agentWithChatHistoryPromise = initAgent();
    }
    return this.agentWithChatHistoryPromise;
  }

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

      const agentWithChatHistory = await this.getAgent();

      let hasStarted = false;
      let finalOutput = "";

      const streamConfig = {
        configurable: { sessionId },
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              if (!hasStarted) {
                hasStarted = true;
                onChunk(""); // Initialize stream
              }
              onChunk(token);
            },
            handleChainEnd() {
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

      const response = await agentWithChatHistory.invoke(
        { input },
        streamConfig
      );

      if (response && response.output) {
        finalOutput = response.output;
        for (let i = 0; i < finalOutput.length; i++) {
          onChunk(finalOutput[i]);
          await new Promise((r) => setTimeout(r, 20));
        }
      }

      onComplete();
    } catch (error) {
      console.error("❌ Agent service error:", error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Non-streaming response
   */
  async getResponse(input: string, sessionId: string): Promise<string> {
    const agentWithChatHistory = await this.getAgent();
    const response = await agentWithChatHistory.invoke(
      { input },
      { configurable: { sessionId } }
    );
    return response.output || response.content || "No response generated";
  }

  async clearSession(sessionId: string): Promise<void> {
    console.log("🗑️ Clearing session:", sessionId);
    // nothing needed if using in-memory ChatMessageHistory
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.getResponse("Hello", `health_${Date.now()}`);
      return typeof response === "string" && response.length > 0;
    } catch {
      return false;
    }
  }
}

export const agentService = new AgentService();
