import { ChatOpenAI } from "@langchain/openai";
import { delegationTools } from "./delegation_tools";
import { buildMultisigTools } from "./multisig_tools";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";


const llm = new ChatOpenAI({
  model: "deepseek/deepseek-chat-v3.1",
  temperature: 0.8,
  streaming: true,
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY, // better to pass via env
  configuration: {
    baseURL: "https://openrouter.ai/api/v1", // ✅ correct way
  },
});




const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI assistant specialized in programmable multi-signature wallets on the Stacks blockchain. You help users with:

1. **Multi-Signature Operations**: Create and manage multi-sig wallets with configurable thresholds (like 2/3, 3/5). Help with proposing transfers, approving transactions, and managing owners.

2. **AI Agent Delegation**: Set up autonomous AI agents that can propose and approve transactions under defined constraints like budget caps, recurring payments, and custom "laws" or rules.

3. **Expense Sharing**: Implement Splitwise-style functionality for recording shared expenses, tracking debts between users, and automatically settling them through multi-sig contract execution.

4. **Stacks Integration**: Interact with Clarity smart contracts, handle STX transfers, and manage blockchain transactions on the Stacks network.

You have access to specialized tools for multi-sig operations and delegation management. Always provide clear, step-by-step guidance and explain the security implications of actions. Be helpful, accurate, and security-conscious.`],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const tools = [
  ...buildMultisigTools(),
  ...delegationTools,
];

const modalwithtools = llm.bindTools(tools);


const agent = await createToolCallingAgent({ llm: modalwithtools, tools, prompt });

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const store: { [sessionId: string]: BaseChatMessageHistory } = {};

function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  if (!(sessionId in store)) {
    store[sessionId] = new ChatMessageHistory();
  }
  return store[sessionId];
}

const agentWithChatHistory = new RunnableWithMessageHistory({
  runnable: agentExecutor,
  getMessageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

export { agentWithChatHistory };


