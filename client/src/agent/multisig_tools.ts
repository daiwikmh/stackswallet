// multisig.tools.ts
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";

// Import your contract wrapper (the class you provided)
import { MultisigContract } from '../components/multisig/contract';

/** ─────────────────────────────────────────────────────────────────────────────
 * Zod Schemas (light validation suitable for browser-side use)
 * You can harden these further if needed.
 * ────────────────────────────────────────────────────────────────────────────*/
const stacksPrincipal = z
  .string()
  .min(20, "Stacks principal seems too short")
  .regex(/^S[T|P][A-Z0-9]+/i, "Must start with ST... or SP...");

const txIdSchema = z.number().int().nonnegative();

const microStxSchema = z
  .number()
  .int()
  .nonnegative()
  .describe("Amount in microSTX (1 STX = 1_000_000 microSTX)");

/** ─────────────────────────────────────────────────────────────────────────────
 * Write-call Tools (trigger @stacks/connect popups)
 * ────────────────────────────────────────────────────────────────────────────*/
export const initializeTool = new DynamicStructuredTool({
  name: "multisig_initialize",
  description:
    "Initialize the multisig wallet with a list of owner addresses and the required approval threshold.",
  schema: z.object({
    initialOwners: z.array(stacksPrincipal).min(1),
    requiredApprovals: z
      .number()
      .int()
      .positive()
      .describe("Number of approvals required to execute a transaction"),
  }),
  func: async ({ initialOwners, requiredApprovals }) => {
    await MultisigContract.initialize(initialOwners, requiredApprovals);
    return "Initialize transaction submitted via Stacks wallet.";
  },
});

export const depositTool = new DynamicStructuredTool({
  name: "multisig_deposit",
  description:
    "Deposit microSTX into the multisig contract balance. Amount must be in microSTX.",
  schema: z.object({
    amountMicroSTX: microStxSchema,
  }),
  func: async ({ amountMicroSTX }) => {
    await MultisigContract.deposit(amountMicroSTX);
    return "Deposit transaction submitted via Stacks wallet.";
  },
});

export const proposeTransactionTool = new DynamicStructuredTool({
  name: "multisig_propose_transaction",
  description:
    "Propose a new transfer transaction from the multisig to a recipient. Amount in microSTX. Optional memo.",
  schema: z.object({
    recipient: stacksPrincipal,
    amountMicroSTX: microStxSchema,
    memo: z.string().max(256).optional(),
  }),
  func: async ({ recipient, amountMicroSTX, memo }) => {
    await MultisigContract.proposeTransaction(recipient, amountMicroSTX, memo);
    return "Propose transaction submitted via Stacks wallet.";
  },
});

export const approveTransactionTool = new DynamicStructuredTool({
  name: "multisig_approve_transaction",
  description: "Approve a pending multisig transaction by its transaction id.",
  schema: z.object({ txId: txIdSchema }),
  func: async ({ txId }) => {
    await MultisigContract.approveTransaction(txId);
    return `Approve transaction #${txId} submitted via Stacks wallet`;
  },
});

export const executeTransactionTool = new DynamicStructuredTool({
  name: "multisig_execute_transaction",
  description:
    "Execute a transaction if it has reached the required approval threshold.",
  schema: z.object({ txId: txIdSchema }),
  func: async ({ txId }) => {
    await MultisigContract.executeTransaction(txId);
    return `Execute transaction #${txId} submitted via Stacks wallet.`;
  },
});

export const addOwnerTool = new DynamicStructuredTool({
  name: "multisig_add_owner",
  description: "Add a new owner to the multisig wallet.",
  schema: z.object({ newOwner: stacksPrincipal }),
  func: async ({ newOwner }) => {
    await MultisigContract.addOwner(newOwner);
    return `Add owner (${newOwner}) transaction submitted via Stacks wallet.`;
  },
});

export const removeOwnerTool = new DynamicStructuredTool({
  name: "multisig_remove_owner",
  description: "Remove an existing owner from the multisig wallet.",
  schema: z.object({ ownerToRemove: stacksPrincipal }),
  func: async ({ ownerToRemove }) => {
    await MultisigContract.removeOwner(ownerToRemove);
    return `Remove owner (${ownerToRemove}) transaction submitted via Stacks wallet.`;
  },
});

export const changeThresholdTool = new DynamicStructuredTool({
  name: "multisig_change_threshold",
  description:
    "Change the required approval threshold for executing transactions.",
  schema: z.object({ newThreshold: z.number().int().positive() }),
  func: async ({ newThreshold }) => {
    await MultisigContract.changeThreshold(newThreshold);
    return `Change threshold to ${newThreshold} submitted via Stacks wallet.`;
  },
});

/** ─────────────────────────────────────────────────────────────────────────────
 * Read-only Tools (no wallet popup; return JSON for the agent to reason with)
 * ────────────────────────────────────────────────────────────────────────────*/
export const getWalletInfoTool = new DynamicStructuredTool({
  name: "multisig_get_wallet_info",
  description:
    "Get multisig wallet info: owners count, threshold, balance, and transaction nonce.",
  schema: z.object({}),
  func: async () => {
    const info = await MultisigContract.getWalletInfo();
    return JSON.stringify(info ?? null);
  },
});

export const getTransactionTool = new DynamicStructuredTool({
  name: "multisig_get_transaction",
  description:
    "Fetch a transaction by its id with proposer, recipient, amount, memo, approvals, and timestamps.",
  schema: z.object({ txId: txIdSchema }),
  func: async ({ txId }) => {
    const tx = await MultisigContract.getTransaction(txId);
    return JSON.stringify(tx ?? null);
  },
});

export const checkIsOwnerTool = new DynamicStructuredTool({
  name: "multisig_check_is_owner",
  description: "Check if a given address is an owner of the multisig.",
  schema: z.object({ user: stacksPrincipal }),
  func: async ({ user }) => {
    const isOwner = await MultisigContract.checkIsOwner(user);
    return JSON.stringify({ user, isOwner });
  },
});

export const getOwnerInfoTool = new DynamicStructuredTool({
  name: "multisig_get_owner_info",
  description: "Get owner metadata (addedAt, active) for a given address.",
  schema: z.object({ owner: stacksPrincipal }),
  func: async ({ owner }) => {
    const info = await MultisigContract.getOwnerInfo(owner);
    return JSON.stringify(info ?? null);
  },
});

export const getApprovalStatusTool = new DynamicStructuredTool({
  name: "multisig_get_approval_status",
  description:
    "Get approval status for a (txId, owner) pair: approved and approvedAt.",
  schema: z.object({ txId: txIdSchema, owner: stacksPrincipal }),
  func: async ({ txId, owner }) => {
    const status = await MultisigContract.getApprovalStatus(txId, owner);
    return JSON.stringify(status ?? null);
  },
});

export const canExecuteTransactionTool = new DynamicStructuredTool({
  name: "multisig_can_execute_transaction",
  description:
    "Check if a transaction (by id) can be executed given current approvals.",
  schema: z.object({ txId: txIdSchema }),
  func: async ({ txId }) => {
    const can = await MultisigContract.canExecuteTransaction(txId);
    return JSON.stringify({ txId, canExecute: can });
  },
});

export const getBalanceTool = new DynamicStructuredTool({
  name: "multisig_get_balance",
  description:
    "Get the current contract balance in microSTX (number). Convert externally if you need STX.",
  schema: z.object({}),
  func: async () => {
    const bal = await MultisigContract.getBalance();
    return JSON.stringify({ balanceMicroSTX: bal });
  },
});

/** ─────────────────────────────────────────────────────────────────────────────
 * Helper to build the full tools array
 * ────────────────────────────────────────────────────────────────────────────*/
export function buildMultisigTools(): StructuredToolInterface[] {
  return [
    // write calls
    initializeTool,
    depositTool,
    proposeTransactionTool,
    approveTransactionTool,
    executeTransactionTool,
    addOwnerTool,
    removeOwnerTool,
    changeThresholdTool,

    // read calls
    getWalletInfoTool,
    getTransactionTool,
    checkIsOwnerTool,
    getOwnerInfoTool,
    getApprovalStatusTool,
    canExecuteTransactionTool,
    getBalanceTool,
  ];
}