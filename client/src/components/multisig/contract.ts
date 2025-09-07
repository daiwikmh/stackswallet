// Multisig Wallet Contract Interface
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

// Contract details
export const CONTRACT_ADDRESS = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
export const CONTRACT_NAME = 'multisig';

// Network configuration
export const NETWORK = STACKS_TESTNET;

export interface WalletInfo {
  ownersCount: number;
  approvalThreshold: number;
  balance: number;
  transactionNonce: number;
}

export interface TransactionInfo {
  proposer: string;
  recipient: string;
  amount: number;
  memo?: string;
  approvals: number;
  executed: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface OwnerInfo {
  addedAt: number;
  active: boolean;
}

export interface ApprovalInfo {
  approved: boolean;
  approvedAt: number;
}

// Contract call functions
export class MultisigContract {
  static async initialize(
    initialOwners: string[],
    requiredApprovals: number
  ) {
    const functionArgs = [
      listCV(initialOwners.map(owner => standardPrincipalCV(owner))),
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
        console.log('✅ Initialize transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Initialize transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async deposit(amount: number) {
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
        console.log('✅ Deposit transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Deposit transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async proposeTransaction(
    recipient: string,
    amount: number,
    memo?: string
  ) {
    const functionArgs = [
      standardPrincipalCV(recipient),
      uintCV(amount),
      memo ? someCV(bufferCV(Buffer.from(memo, 'utf8'))) : noneCV(),
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
        console.log('✅ Propose transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Propose transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async approveTransaction(txId: number) {
    const functionArgs = [
      uintCV(txId),
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
        console.log('✅ Approve transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Approve transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async executeTransaction(txId: number) {
    const functionArgs = [
      uintCV(txId),
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
        console.log('✅ Execute transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Execute transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async addOwner(newOwner: string) {
    const functionArgs = [
      standardPrincipalCV(newOwner),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'add-owner',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Add owner transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Add owner transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async removeOwner(ownerToRemove: string) {
    const functionArgs = [
      standardPrincipalCV(ownerToRemove),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'remove-owner',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Remove owner transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Remove owner transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  static async changeThreshold(newThreshold: number) {
    const functionArgs = [
      uintCV(newThreshold),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'change-threshold',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Change threshold transaction submitted:', data);
      },
      onCancel: () => {
        console.log('❌ Change threshold transaction cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Read-only functions
  static async getWalletInfo(): Promise<WalletInfo | null> {
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
          ownersCount: parseInt(resultData.value['owners-count'].value),
          approvalThreshold: parseInt(resultData.value['approval-threshold'].value),
          balance: parseInt(resultData.value.balance.value),
          transactionNonce: parseInt(resultData.value['transaction-nonce'].value)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      return null;
    }
  }

  static async getTransaction(txId: number): Promise<TransactionInfo | null> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-transaction',
        functionArgs: [uintCV(txId)],
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
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  static async checkIsOwner(user: string): Promise<boolean> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'check-is-owner',
        functionArgs: [standardPrincipalCV(user)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return resultData.value;
    } catch (error) {
      console.error('Error checking owner status:', error);
      return false;
    }
  }

  static async getOwnerInfo(owner: string): Promise<OwnerInfo | null> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-owner-info',
        functionArgs: [standardPrincipalCV(owner)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      
      if (resultData.type === 'none') {
        return null;
      }

      if (resultData.type === 'some' && resultData.value) {
        const ownerData = resultData.value.value;
        return {
          addedAt: parseInt(ownerData['added-at'].value),
          active: ownerData.active.value
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching owner info:', error);
      return null;
    }
  }

  static async getApprovalStatus(txId: number, owner: string): Promise<ApprovalInfo | null> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-approval-status',
        functionArgs: [uintCV(txId), standardPrincipalCV(owner)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      
      if (resultData.type === 'none') {
        return null;
      }

      if (resultData.type === 'some' && resultData.value) {
        const approvalData = resultData.value.value;
        return {
          approved: approvalData.approved.value,
          approvedAt: parseInt(approvalData['approved-at'].value)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching approval status:', error);
      return null;
    }
  }

  static async canExecuteTransaction(txId: number): Promise<boolean> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'can-execute-transaction',
        functionArgs: [uintCV(txId)],
        senderAddress: CONTRACT_ADDRESS,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return resultData.value;
    } catch (error) {
      console.error('Error checking if transaction can be executed:', error);
      return false;
    }
  }

  static async getBalance(): Promise<number> {
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
      console.error('Error fetching contract balance:', error);
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