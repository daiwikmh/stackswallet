import { z } from "zod";
import { DynamicStructuredTool } from "langchain/tools";

// your sendSTXFromAgent from above
async function sendSTXFromAgent(
  recipientAddress: string,
  amount: number,
  memo?: string
): Promise<string> {
  if (!activeAgent) {
    throw new Error("No active agent selected");
  }

  setIsLoading(true);
  try {
    const txId = await AgentSystem.sendSTXFromAgent(
      activeAgent,
      recipientAddress,
      amount,
      memo
    );

    const transaction: AgentTransaction = {
      id: `tx-${Date.now()}`,
      fromAgent: activeAgent.id,
      toAddress: recipientAddress,
      amount,
      memo,
      status: "pending",
      txId,
      createdAt: new Date(),
    };

    setTransactions((prev) => [transaction, ...prev]);
    return txId;
  } catch (error) {
    console.error("❌ Failed to send STX from agent:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
}

// --- Define tool schema ---
const sendStxSchema = z.object({
  recipientAddress: z
    .string()
    .min(1, "Recipient address required")
    .describe("Stacks address of the recipient"),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .describe("Amount of STX to send"),
  memo: z.string().optional().describe("Optional memo for the transaction"),
});

// --- Create DynamicStructuredTool ---
export const SendStxTool = new DynamicStructuredTool({
  name: "send_stx_from_agent",
  description:
    "Send STX from the currently active agent to a given recipient address with an optional memo.",
  schema: sendStxSchema,
  func: async ({ recipientAddress, amount, memo }) => {
    const txId = await sendSTXFromAgent(recipientAddress, amount, memo);
    return `Transaction submitted with txId: ${txId}`;
  },
});
