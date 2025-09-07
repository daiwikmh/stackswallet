// Agent System Contract Interface
import { 
  generateWallet, 
  generateSecretKey, 
  generateNewAccount,
  getStxAddress
} from '@stacks/wallet-sdk';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  makeSTXTokenTransfer,
  makeRandomPrivKey,
  
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { openContractCall } from '@stacks/connect';

// Network configuration - using string as per docs
export const NETWORK = STACKS_TESTNET;

export interface AgentWallet {
  id: string;
  name: string;
  address: string;
  secretKey: string;
  publicKey: string;
  mnemonic: string;
  createdAt: Date;
  isActive: boolean;
  balance: number;
  delegatedAmount?: number;
  delegationStatus?: 'none' | 'pending' | 'active';
}

export interface AgentTransaction {
  id: string;
  fromAgent: string;
  toAddress: string;
  amount: number;
  memo?: string;
  status: 'pending' | 'confirmed' | 'failed';
  txId?: string;
  createdAt: Date;
}

// Agent Wallet Management System
export class AgentSystem {
  
  // Generate a new agent wallet with unique identity
  static async generateAgentWallet(name: string): Promise<AgentWallet> {
    try {
      // Generate a new secret key (24-word mnemonic by default)
      const secretKey = generateSecretKey();
      console.log('🔑 Generated secret key:', secretKey.split(' ').length + ' words');
      
      // Generate wallet from secret key (first account is created automatically)
      const wallet = await generateWallet({
        secretKey,
        password: `agent-${Date.now()}` // Simple password for demo
      });

      // Get the first account (automatically generated)
      const account = wallet.accounts[0];
      
      // Get STX address for testnet explicitly
      const address = getStxAddress({ account, network: STACKS_TESTNET });

      const agentWallet: AgentWallet = {
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        address,
        secretKey: account.stxPrivateKey, // Use the account's STX private key directly
        publicKey: '', // Not needed for basic functionality
        mnemonic: secretKey, // Store the original secret key as mnemonic
        createdAt: new Date(),
        isActive: true,
        balance: 0,
        delegationStatus: 'none'
      };

      console.log('✅ Generated new agent wallet:', {
        id: agentWallet.id,
        name: agentWallet.name,
        address: agentWallet.address,
        mnemonic: secretKey.split(' ').length + ' words',
        accountIndex: account.index
      });

      return agentWallet;
    } catch (error) {
      console.error('❌ Failed to generate agent wallet:', error);
      throw new Error(`Failed to generate agent wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send STX from agent wallet to any address
  static async sendSTXFromAgent(
    agent: AgentWallet,
    recipientAddress: string,
    amount: number,
    memo?: string
  ): Promise<string> {
    try {
      const txOptions = {
        recipient: recipientAddress,
        amount: BigInt(amount),
        senderKey: agent.secretKey, // Use the STX private key directly
        network: NETWORK, // 'testnet' as per docs
        memo: memo || `Transfer from agent ${agent.name}`,
      };

      const transaction = await makeSTXTokenTransfer(txOptions);
      
      // Broadcasting transaction to the specified network (following docs pattern)
const broadcastResponse = await broadcastTransaction({
  transaction,         // 👈 wrapped inside an object
  network: STACKS_TESTNET,
});      const txId = broadcastResponse.txid;

      console.log('✅ Agent STX transfer broadcasted:', {
        from: agent.address,
        to: recipientAddress,
        amount: amount / 1_000_000,
        txId
      });

      return txId;
    } catch (error) {
      console.error('❌ Failed to send STX from agent:', error);
      throw error;
    }
  }

  // Delegate STX to agent using existing delegation contract
  static async delegateToAgent(
    userAddress: string,
    agentWallet: AgentWallet,
    amount: number,
    dailyLimit: number,
    duration: number
  ) {
    const functionArgs = [
      standardPrincipalCV(agentWallet.address), // delegate to agent
      uintCV(amount),                           // total amount
      uintCV(dailyLimit),                       // daily spending limit
      uintCV(duration),                         // duration in blocks
    ];

    const txOptions = {
      contractAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
      contractName: 'delegation',
      functionName: 'create-delegation',
      functionArgs,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('✅ Delegation to agent created:', data);
      },
      onCancel: () => {
        console.log('❌ Delegation to agent cancelled');
      }
    };

    return openContractCall(txOptions);
  }

  // Agent spends delegated STX
  static async spendDelegatedSTX(
    agent: AgentWallet,
    recipientAddress: string,
    amount: number,
    memo?: string
  ) {
    const functionArgs = [
      standardPrincipalCV(recipientAddress),
      uintCV(amount),
      stringAsciiCV(memo || `Agent ${agent.name} spending`)
    ];

    // Create transaction using agent's private key
    const txOptions = {
      contractAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
      contractName: 'delegation',
      functionName: 'spend-delegated',
      functionArgs,
      senderKey: agent.secretKey, // Use the STX private key directly
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    
    // Broadcasting transaction to the specified network (following docs pattern)
const broadcastResponse = await broadcastTransaction({
  transaction,         // 👈 wrapped inside an object
  network: STACKS_TESTNET,
});    const txId = broadcastResponse.txid;
    
    console.log('✅ Agent spent delegated STX:', {
      agent: agent.name,
      to: recipientAddress,
      amount: amount / 1_000_000,
      txId
    });

    return txId;
  }

  // Get agent balance (both owned and delegated)
  static async getAgentBalance(agent: AgentWallet): Promise<{ owned: number; delegated: number }> {
    try {
      // This would need to be implemented with actual blockchain queries
      // For now, return mock data
      return {
        owned: 0, // Query actual STX balance
        delegated: agent.delegatedAmount || 0
      };
    } catch (error) {
      console.error('❌ Failed to get agent balance:', error);
      return { owned: 0, delegated: 0 };
    }
  }

  // Validate agent wallet
  static validateAgent(agent: AgentWallet): boolean {
    try {
      return !!(
        agent.id &&
        agent.address &&
        agent.secretKey &&
        agent.address.startsWith('ST') // Testnet addresses
      );
    } catch {
      return false;
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

export const formatAddress = (addr: string): string => {
  if (!addr) return 'No address';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Storage helpers for managing agents in localStorage
export const AgentStorage = {
  STORAGE_KEY: 'bitlend-agents',

  saveAgents(agents: AgentWallet[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(agents));
    } catch (error) {
      console.error('Failed to save agents:', error);
    }
  },

  loadAgents(): AgentWallet[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const agents = JSON.parse(stored);
      return agents.map((agent: any) => ({
        ...agent,
        createdAt: new Date(agent.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load agents:', error);
      return [];
    }
  },

  addAgent(agent: AgentWallet): void {
    const agents = this.loadAgents();
    agents.push(agent);
    this.saveAgents(agents);
  },

  updateAgent(agentId: string, updates: Partial<AgentWallet>): void {
    const agents = this.loadAgents();
    const index = agents.findIndex(a => a.id === agentId);
    if (index !== -1) {
      agents[index] = { ...agents[index], ...updates };
      this.saveAgents(agents);
    }
  },

  removeAgent(agentId: string): void {
    const agents = this.loadAgents().filter(a => a.id !== agentId);
    this.saveAgents(agents);
  }
};