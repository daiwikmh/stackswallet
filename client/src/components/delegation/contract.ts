// Delegation Contract Interface
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
  fetchCallReadOnlyFunction
} from '@stacks/transactions';
import { StacksNetwork, STACKS_TESTNET} from '@stacks/network';
import { openContractCall } from '@stacks/connect';

// Contract details
export const CONTRACT_ADDRESS = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
export const CONTRACT_NAME = 'delegation';

// Network configuration (adjust based on your deployment)
export const NETWORK = STACKS_TESTNET;

export interface DelegationInfo {
  amount: number;
  dailyLimit: number;
  spentToday: number;
  spentTotal: number;
  lastDay: number;
  startBlock: number;
  endBlock: number;
  active: boolean;
}

export interface DelegationStatus {
  totalAmount: number;
  availableAmount: number;
  dailyLimit: number;
  spentToday: number;
  spentTotal: number;
  dailyRemaining: number;
  blocksUntilExpiry: number;
  isActive: boolean;
}

// Contract call functions
export class DelegationContract {
  static async createDelegationAndDeposit(
    delegate: string,
    amount: number,
    dailyLimit: number,
    durationDays: number,
    senderAddress: string
  ) {
    const functionArgs = [
      standardPrincipalCV(delegate),
      uintCV(amount),
      uintCV(dailyLimit),
      uintCV(durationDays),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-delegation-and-deposit',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    // Use Stacks Connect to open wallet
    return openContractCall(txOptions);
  }

  static async addFunds(
    delegate: string,
    additionalAmount: number,
    senderAddress: string
  ) {
    const functionArgs = [
      standardPrincipalCV(delegate),
      uintCV(additionalAmount),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'add-funds',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    return openContractCall(txOptions);
  }

  static async spendDelegated(
    owner: string,
    amount: number,
    recipient: string
  ) {
    const functionArgs = [
      standardPrincipalCV(owner),
      uintCV(amount),
      standardPrincipalCV(recipient),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'spend-delegated',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    return openContractCall(txOptions);
  }

  static async withdrawRemaining(delegate: string) {
    const functionArgs = [
      standardPrincipalCV(delegate),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'withdraw-remaining',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    return openContractCall(txOptions);
  }

  static async revokeDelegation(delegate: string) {
    const functionArgs = [
      standardPrincipalCV(delegate),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'revoke-delegation',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    return openContractCall(txOptions);
  }

  static async extendDelegation(delegate: string, additionalDays: number) {
    const functionArgs = [
      standardPrincipalCV(delegate),
      uintCV(additionalDays),
    ];

    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'extend-delegation',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    return openContractCall(txOptions);
  }

  // Read-only functions using callReadOnlyFunction
  static async getDelegation(owner: string, delegate: string): Promise<DelegationInfo | null> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-delegation',
        functionArgs: [
          standardPrincipalCV(owner),
          standardPrincipalCV(delegate)
        ],
        senderAddress: owner,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      
      if (resultData.type === 'none') {
        return null;
      }

      if (resultData.type === 'some' && resultData.value) {
        const delegationData = resultData.value.value;
        return {
          amount: parseInt(delegationData.amount.value),
          dailyLimit: parseInt(delegationData['daily-limit'].value),
          spentToday: parseInt(delegationData['spent-today'].value),
          spentTotal: parseInt(delegationData['spent-total'].value),
          lastDay: parseInt(delegationData['last-day'].value),
          startBlock: parseInt(delegationData['start-block'].value),
          endBlock: parseInt(delegationData['end-block'].value),
          active: delegationData.active.value
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching delegation:', error);
      return null;
    }
  }

  static async getDelegationStatus(owner: string, delegate: string): Promise<DelegationStatus | null> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-delegation-status',
        functionArgs: [
          standardPrincipalCV(owner),
          standardPrincipalCV(delegate)
        ],
        senderAddress: owner,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      
      if (resultData.type === 'none') {
        return null;
      }

      if (resultData.type === 'some' && resultData.value) {
        const statusData = resultData.value.value;
        return {
          totalAmount: parseInt(statusData['total-amount'].value),
          availableAmount: parseInt(statusData['available-amount'].value),
          dailyLimit: parseInt(statusData['daily-limit'].value),
          spentToday: parseInt(statusData['spent-today'].value),
          spentTotal: parseInt(statusData['spent-total'].value),
          dailyRemaining: parseInt(statusData['daily-remaining'].value),
          blocksUntilExpiry: parseInt(statusData['blocks-until-expiry'].value),
          isActive: statusData['is-active'].value
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching delegation status:', error);
      return null;
    }
  }

  static async getAvailableAmount(owner: string, delegate: string): Promise<number> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-available-amount',
        functionArgs: [
          standardPrincipalCV(owner),
          standardPrincipalCV(delegate)
        ],
        senderAddress: owner,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return parseInt(resultData.value);
    } catch (error) {
      console.error('Error fetching available amount:', error);
      return 0;
    }
  }

  static async isDelegationValid(owner: string, delegate: string): Promise<boolean> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-delegation-valid',
        functionArgs: [
          standardPrincipalCV(owner),
          standardPrincipalCV(delegate)
        ],
        senderAddress: owner,
        network: NETWORK
      });

      const resultData = cvToJSON(result);
      return resultData.value;
    } catch (error) {
      console.error('Error checking delegation validity:', error);
      return false;
    }
  }

  static async getContractBalance(): Promise<number> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-contract-balance',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS, // Use contract address as sender for balance check
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