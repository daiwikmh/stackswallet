// Splitwise Contract Interface - Built on Multisig Contract
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  contractPrincipalCV,
  FungibleConditionCode,
  cvToJSON,
  hexToCV,
  fetchCallReadOnlyFunction,
  listCV,
  someCV,
  noneCV,
  bufferCV
} from '@stacks/transactions';
import { StacksNetwork, STACKS_TESTNET} from '@stacks/network';
import { openContractCall } from '@stacks/connect';

// Contract details - Using the same multisig contract
export const CONTRACT_ADDRESS = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
export const CONTRACT_NAME = 'multisig';

// Network configuration
export const NETWORK = STACKS_TESTNET;

export interface SplitExpense {
  id: number;
  title: string;
  description: string;
  totalAmount: number;
  paidBy: string;
  splitAmong: string[];
  perPersonAmount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  approvals: number;
  requiredApprovals: number;
  transactionId?: number;
}

export interface SplitMember {
  address: string;
  name?: string;
  isActive: boolean;
}

// Split Payment utilities using Multisig contract
export class SplitwiseContract {
  
  // Initialize the group wallet with members
  static async initializeGroup(
    members: string[],
    requiredApprovals: number
  ) {
    const functionArgs = [
      listCV(members.map(member => standardPrincipalCV(member))),
      uintCV(requiredApprovals),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'initialize',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Group initialized:', data);
      },
      onCancel: () => {
        console.log('❌ Group initialization cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Deposit funds to the group wallet
  static async depositToGroup(amount: number) {
    const functionArgs = [
      uintCV(amount),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'deposit',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Funds deposited to group:', data);
      },
      onCancel: () => {
        console.log('❌ Deposit cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Create a split expense (propose transaction)
  static async createSplitExpense(
    paidTo: string,
    totalAmount: number,
    expenseTitle: string,
    splitMembers: string[],
    category: string = 'general'
  ) {
    // Create memo with split information
    const splitInfo = {
      title: expenseTitle,
      members: splitMembers,
      perPerson: Math.floor(totalAmount / splitMembers.length),
      category: category,
      type: 'split'
    };
    
    const memo = `${expenseTitle} - Split: ${splitMembers.length} people, ${splitInfo.perPerson/1000000} STX each`;
    
    const functionArgs = [
      standardPrincipalCV(paidTo),
      uintCV(totalAmount),
      someCV(bufferCV(Buffer.from(memo.substring(0, 34), 'utf8'))), // Memo limited to 34 chars
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'propose-transaction',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Split expense created:', data);
      },
      onCancel: () => {
        console.log('❌ Split expense creation cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Approve a split expense
  static async approveSplitExpense(transactionId: number) {
    const functionArgs = [
      uintCV(transactionId),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'approve-transaction',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Split expense approved:', data);
      },
      onCancel: () => {
        console.log('❌ Approval cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Execute/settle a split expense
  static async settleSplitExpense(transactionId: number) {
    const functionArgs = [
      uintCV(transactionId),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'execute-transaction',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Split expense settled:', data);
      },
      onCancel: () => {
        console.log('❌ Settlement cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Read-only functions using multisig contract

  // Get group wallet info
  static async getGroupInfo(): Promise<any> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-wallet-info',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      
      if (resultData.value) {
        return {
          membersCount: parseInt(resultData.value['owners-count'].value),
          approvalThreshold: parseInt(resultData.value['approval-threshold'].value),
          balance: parseInt(resultData.value.balance.value),
          transactionNonce: parseInt(resultData.value['transaction-nonce'].value)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching group info:', error);
      return null;
    }
  }

  // Get split expense details (transaction details)
  static async getSplitExpense(transactionId: number): Promise<any> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-transaction',
        functionArgs: [uintCV(transactionId)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      
      if (resultData.type === 'none') {
        return null;
      }

      if (resultData.type === 'some' && resultData.value) {
        const txData = resultData.value.value;
        return {
          proposer: txData.proposer.value,
          recipient: txData.recipient.value,
          amount: parseInt(txData.amount.value),
          memo: txData.memo.type === 'some' ? Buffer.from(txData.memo.value.value, 'hex').toString('utf8') : undefined,
          approvals: parseInt(txData.approvals.value),
          executed: txData.executed.value,
          createdAt: parseInt(txData['created-at'].value),
          expiresAt: parseInt(txData['expires-at'].value)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching split expense:', error);
      return null;
    }
  }

  // Check if user is group member
  static async isGroupMember(userAddress: string): Promise<boolean> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'check-is-owner',
        functionArgs: [standardPrincipalCV(userAddress)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return resultData.value;
    } catch (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
  }

  // Check if expense can be settled
  static async canSettleExpense(transactionId: number): Promise<boolean> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'can-execute-transaction',
        functionArgs: [uintCV(transactionId)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return resultData.value;
    } catch (error) {
      console.error('Error checking settlement status:', error);
      return false;
    }
  }

  // Get group balance
  static async getGroupBalance(): Promise<number> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return parseInt(resultData.value);
    } catch (error) {
      console.error('Error fetching group balance:', error);
      return 0;
    }
  }
}

// Helper functions
export const microSTXToSTX = (microSTX: number): number => {
  return microSTX / 1_000_000;
};

export const STXToMicroSTX = (stx: number): number => {
  return Math.floor(stx * 1_000_000);
};

export const formatSTX = (microSTX: number): string => {
  return `${microSTXToSTX(microSTX).toFixed(6)} STX`;
};

export const formatAddress = (addr: string | null): string => {
  if (!addr || typeof addr !== 'string') return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Parse split info from memo
export const parseSplitMemo = (memo: string): { title: string, members?: number, perPerson?: number } => {
  try {
    const parts = memo.split(' - Split: ');
    if (parts.length === 2) {
      const title = parts[0];
      const splitInfo = parts[1];
      const memberMatch = splitInfo.match(/(\d+) people/);
      const amountMatch = splitInfo.match(/([\d.]+) STX each/);
      
      return {
        title,
        members: memberMatch ? parseInt(memberMatch[1]) : undefined,
        perPerson: amountMatch ? parseFloat(amountMatch[1]) : undefined
      };
    }
    return { title: memo };
  } catch {
    return { title: memo };
  }
};

// Common expense categories
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Drinks', icon: '🍕' },
  { id: 'transport', label: 'Transportation', icon: '🚗' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'utilities', label: 'Utilities', icon: '⚡' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'general', label: 'General', icon: '💰' },
];