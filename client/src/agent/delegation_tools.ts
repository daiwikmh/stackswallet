import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import {DelegationContract} from '../components/delegation/contract'; 
// Helper: Create dynamic structured tool
const makeTool = (
  name: string,
  description: string,
  schema: any,
  func: (...args: any[]) => Promise<any>
) =>
  new DynamicStructuredTool({
    name,
    description,
    schema,
    func,
  });

// ---------------- Tools ----------------

// Create Delegation + Deposit
export const createDelegationAndDepositTool = makeTool(
  "createDelegationAndDeposit",
  "Create a delegation with deposit (specify delegate, amount in microSTX, daily limit, duration in days, sender address).",
  z.object({
    delegate: z.string().describe("Delegate Stacks address"),
    amount: z.number().describe("Amount in microSTX"),
    dailyLimit: z.number().describe("Daily spend limit in microSTX"),
    durationDays: z.number().describe("Duration in days"),
    senderAddress: z.string().describe("Sender Stacks address"),
  }),
  async ({ delegate, amount, dailyLimit, durationDays, senderAddress }) =>
    DelegationContract.createDelegationAndDeposit(
      delegate,
      amount,
      dailyLimit,
      durationDays,
      senderAddress
    )
);

// Add funds
export const addFundsTool = makeTool(
  "addFunds",
  "Add additional funds to a delegation.",
  z.object({
    delegate: z.string(),
    additionalAmount: z.number().describe("Amount in microSTX"),
    senderAddress: z.string(),
  }),
  async ({ delegate, additionalAmount, senderAddress }) =>
    DelegationContract.addFunds(delegate, additionalAmount, senderAddress)
);

// Spend delegated funds
export const spendDelegatedTool = makeTool(
  "spendDelegated",
  "Spend delegated funds from an owner to a recipient.",
  z.object({
    owner: z.string(),
    amount: z.number().describe("Amount in microSTX"),
    recipient: z.string(),
  }),
  async ({ owner, amount, recipient }) =>
    DelegationContract.spendDelegated(owner, amount, recipient)
);

// Withdraw remaining
export const withdrawRemainingTool = makeTool(
  "withdrawRemaining",
  "Withdraw remaining delegated funds.",
  z.object({
    delegate: z.string(),
  }),
  async ({ delegate }) => DelegationContract.withdrawRemaining(delegate)
);

// Revoke delegation
export const revokeDelegationTool = makeTool(
  "revokeDelegation",
  "Revoke an active delegation.",
  z.object({
    delegate: z.string(),
  }),
  async ({ delegate }) => DelegationContract.revokeDelegation(delegate)
);

// Extend delegation
export const extendDelegationTool = makeTool(
  "extendDelegation",
  "Extend delegation by additional days.",
  z.object({
    delegate: z.string(),
    additionalDays: z.number(),
  }),
  async ({ delegate, additionalDays }) =>
    DelegationContract.extendDelegation(delegate, additionalDays)
);

// ---------------- Read-only tools ----------------

// Get delegation info
export const getDelegationTool = makeTool(
  "getDelegation",
  "Fetch delegation info for an owner and delegate.",
  z.object({
    owner: z.string(),
    delegate: z.string(),
  }),
  async ({ owner, delegate }) => DelegationContract.getDelegation(owner, delegate)
);

// Get delegation status
export const getDelegationStatusTool = makeTool(
  "getDelegationStatus",
  "Fetch detailed status for a delegation.",
  z.object({
    owner: z.string(),
    delegate: z.string(),
  }),
  async ({ owner, delegate }) =>
    DelegationContract.getDelegationStatus(owner, delegate)
);

// Get available amount
export const getAvailableAmountTool = makeTool(
  "getAvailableAmount",
  "Get the currently available amount for a delegation.",
  z.object({
    owner: z.string(),
    delegate: z.string(),
  }),
  async ({ owner, delegate }) =>
    DelegationContract.getAvailableAmount(owner, delegate)
);

// Check delegation validity
export const isDelegationValidTool = makeTool(
  "isDelegationValid",
  "Check if delegation between owner and delegate is valid.",
  z.object({
    owner: z.string(),
    delegate: z.string(),
  }),
  async ({ owner, delegate }) =>
    DelegationContract.isDelegationValid(owner, delegate)
);

// Get contract balance
export const getContractBalanceTool = makeTool(
  "getContractBalance",
  "Get the balance of the delegation contract.",
  z.object({}),
  async () => DelegationContract.getContractBalance()
);

// ---------------- Export all tools ----------------
export const delegationTools = [
  createDelegationAndDepositTool,
  addFundsTool,
  spendDelegatedTool,
  withdrawRemainingTool,
  revokeDelegationTool,
  extendDelegationTool,
  getDelegationTool,
  getDelegationStatusTool,
  getAvailableAmountTool,
  isDelegationValidTool,
  getContractBalanceTool,
];