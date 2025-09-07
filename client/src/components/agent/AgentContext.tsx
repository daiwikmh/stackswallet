import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { AgentWallet, AgentTransaction, AgentSystem, AgentStorage } from './contract';
import { makeSTXTokenTransfer, broadcastTransaction } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { openSTXTransfer } from '@stacks/connect';

interface AgentContextType {
  agents: AgentWallet[];
  activeAgent: AgentWallet | null;
  transactions: AgentTransaction[];
  isLoading: boolean;
  createAgent: (name: string) => Promise<AgentWallet>;
  selectAgent: (agentId: string) => void;
  updateAgent: (agentId: string, updates: Partial<AgentWallet>) => void;
  deleteAgent: (agentId: string) => void;
  sendSTXFromAgent: (recipientAddress: string, amount: number, memo?: string) => Promise<string>;
  refreshAgents: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);


interface AgentProviderProps {
  children: ReactNode;
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export const AgentProvider = ({ children, walletAddress, isWalletConnected }: AgentProviderProps) => {
  const [agents, setAgents] = useState<AgentWallet[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentWallet | null>(null);
  const [transactions, setTransactions] = useState<AgentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the actual connected wallet info
  const { selectedAddress } = useStacksWallet();

  // Load agents from storage on mount
  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        const storedAgents = AgentStorage.loadAgents();
        setAgents(storedAgents);
        
        // Set first agent as active if none selected
        if (storedAgents.length > 0 && !activeAgent) {
          setActiveAgent(storedAgents[0]);
        }
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Create new agent
  const createAgent = async (name: string): Promise<AgentWallet> => {
    // Use the selectedAddress from StacksWallet context (more reliable)
    const actualWalletAddress = selectedAddress || walletAddress;
    
    if (!actualWalletAddress || !isWalletConnected) {
      throw new Error('Wallet must be connected to create and fund agent');
    }

    setIsLoading(true);
    try {
      // Step 1: Generate the agent wallet
      const newAgent = await AgentSystem.generateAgentWallet(name);
      
      // Step 2: Send 2 STX from user's wallet to agent for gas fees
      console.log('💰 Funding new agent with 2 STX for gas fees...');
      console.log('📍 Connected wallet address (from context):', actualWalletAddress);
      console.log('📍 Wallet connected status:', isWalletConnected);
      console.log('📍 Agent address (recipient):', newAgent.address);
      
      // Verify recipient address format (both ST and SP are valid for testnet)
      if (!newAgent.address || (!newAgent.address.startsWith('ST') && !newAgent.address.startsWith('SP'))) {
        throw new Error(`Invalid agent address format: ${newAgent.address}`);
      }
      
      console.log('✅ Valid agent address generated:', newAgent.address);
      
      // Since we can't access private keys directly from storage, 
      // we need to use a different approach for funding the agent
      console.log('🚀 Creating STX transfer for agent funding...');
      console.log('📍 Recipient (agent address):', newAgent.address);
      console.log('📍 Amount: 2 STX (2,000,000 microSTX)');
      
      // For now, we'll need to use openSTXTransfer since we don't have access to private keys
      // or we need to get the private key from a different source
      
    await openSTXTransfer({
  recipient: newAgent.address,
  amount: '2000000', // microstacks
  memo: `Fund agent: ${newAgent.name}`,
  network: STACKS_TESTNET,
  onFinish: async (data) => {
    console.log('✅ Transfer submitted:', data);
    console.log('📌 TXID:', data.txId);

    // Verify broadcasted tx status
    const res = await fetch(`${STACKS_TESTNET.client.baseUrl}/extended/v1/tx/${data.txId}`);
    const json = await res.json();
    console.log('🔎 Transaction status:', json);
  },
  onCancel: () => {
    console.log('❌ Transfer cancelled');
  },
});


       
      
      // Step 3: Save to storage
      AgentStorage.addAgent(newAgent);
      
      // Step 4: Update state
      setAgents(prev => [...prev, newAgent]);
      
      // Step 5: Set as active agent if it's the first one
      if (agents.length === 0) {
        setActiveAgent(newAgent);
      }

      console.log('✅ Agent created and funded successfully:', {
        name: newAgent.name,
        address: newAgent.address,
        initialFunding: '2 STX',
        fromWallet: actualWalletAddress
      });
      
      return newAgent;
    } catch (error) {
      console.error('❌ Failed to create agent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Select active agent
  const selectAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setActiveAgent(agent);
      console.log('🔄 Selected agent:', agent.name);
    }
  };

  // Update agent
  const updateAgent = (agentId: string, updates: Partial<AgentWallet>) => {
    try {
      AgentStorage.updateAgent(agentId, updates);
      
      setAgents(prev => 
        prev.map(agent => 
          agent.id === agentId ? { ...agent, ...updates } : agent
        )
      );

      // Update active agent if it's the one being updated
      if (activeAgent?.id === agentId) {
        setActiveAgent(prev => prev ? { ...prev, ...updates } : null);
      }

      console.log('✅ Agent updated:', agentId);
    } catch (error) {
      console.error('❌ Failed to update agent:', error);
      throw error;
    }
  };

  // Delete agent
  const deleteAgent = (agentId: string) => {
    try {
      AgentStorage.removeAgent(agentId);
      
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      
      // Clear active agent if it's being deleted
      if (activeAgent?.id === agentId) {
        const remainingAgents = agents.filter(agent => agent.id !== agentId);
        setActiveAgent(remainingAgents.length > 0 ? remainingAgents[0] : null);
      }

      console.log('🗑️ Agent deleted:', agentId);
    } catch (error) {
      console.error('❌ Failed to delete agent:', error);
      throw error;
    }
  };

  // Send STX from active agent
  const sendSTXFromAgent = async (recipientAddress: string, amount: number, memo?: string): Promise<string> => {
    if (!activeAgent) {
      throw new Error('No active agent selected');
    }

    setIsLoading(true);
    try {
      const txId = await AgentSystem.sendSTXFromAgent(
        activeAgent,
        recipientAddress,
        amount,
        memo
      );

      // Add transaction to history
      const transaction: AgentTransaction = {
        id: `tx-${Date.now()}`,
        fromAgent: activeAgent.id,
        toAddress: recipientAddress,
        amount,
        memo,
        status: 'pending',
        txId,
        createdAt: new Date()
      };
      
      setTransactions(prev => [transaction, ...prev]);
      
      return txId;
    } catch (error) {
      console.error('❌ Failed to send STX from agent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  // Refresh agents (reload balances, etc.)
  const refreshAgents = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // This would refresh balances and delegation status from blockchain
      // For now, just reload from storage
      const storedAgents = AgentStorage.loadAgents();
      setAgents(storedAgents);
      
      console.log('🔄 Agents refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AgentContextType = {
    agents,
    activeAgent,
    transactions,
    isLoading,
    createAgent,
    selectAgent,
    updateAgent,
    deleteAgent,
    sendSTXFromAgent,
    refreshAgents,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};