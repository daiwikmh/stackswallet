import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAgent } from './AgentContext';
import { STXToMicroSTX, formatAddress } from './contract';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../delegation/contract';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV
} from '@stacks/transactions';
import { Send, DollarSign, Bot, Zap, ArrowRight, Shield } from 'lucide-react';

interface AgentTransactionProps {
  onSuccess?: () => void;
}

const AgentTransaction: React.FC<AgentTransactionProps> = ({ onSuccess }) => {
  const { activeAgent, isLoading } = useAgent();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpendDelegated = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgent || !recipientAddress || !amount || !ownerAddress) return;

    setIsSubmitting(true);
    try {
      const microSTXAmount = STXToMicroSTX(parseFloat(amount));
      
      // Create contract call transaction using agent's private key
      const functionArgs = [
        standardPrincipalCV(ownerAddress), // Owner who delegated to this agent
        uintCV(microSTXAmount),            // Amount to spend
        standardPrincipalCV(recipientAddress) // Final recipient
      ];

      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'spend-delegated',
        functionArgs,
        senderKey: activeAgent.secretKey, // Agent signs with its own private key
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      // Agent creates and signs the transaction autonomously
      const transaction = await makeContractCall(txOptions);
      
      // Broadcast the transaction to the network (following updated pattern)
      const broadcastResponse = await broadcastTransaction({
        transaction,
        network: NETWORK,
      });
      
      console.log('✅ Transaction broadcast:', broadcastResponse);
      
      // Reset form
      setRecipientAddress('');
      setAmount('');
      setOwnerAddress('');
      
      alert(`Delegated transaction sent autonomously! TX ID: ${broadcastResponse.txid}`);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to spend delegated funds:', error);
      alert(`Failed to spend delegated funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeAgent) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Agent Selected</h3>
        <p className="text-neutral-400">
          Please select an active agent from the Agent Management tab to send transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Agent Delegated Spending</h2>
          <p className="text-neutral-400">Spend delegated STX using your AI agent</p>
        </div>
      </div>

      {/* Active Agent Info */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Bot className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">ACTIVE AGENT</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{activeAgent.name}</h3>
            <p className="text-sm font-mono text-neutral-300">{formatAddress(activeAgent.address)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-400">Delegation Status</p>
            <p className="text-lg font-bold text-orange-400">{activeAgent.delegationStatus || 'No delegation'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSpendDelegated} className="space-y-6">
        {/* Owner Address */}
        <div className="space-y-2">
          <label htmlFor="owner" className="block text-sm font-medium text-white">
            Delegation Owner Address
          </label>
          <input
            id="owner"
            type="text"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            placeholder="SP... or ST... (who delegated to this agent)"
            className="block w-full px-4 py-3 border-2 rounded-lg text-sm font-mono bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
            required
          />
          <p className="text-xs text-neutral-400">
            The address that delegated STX to this agent
          </p>
        </div>
        {/* Recipient Address */}
        <div className="space-y-2">
          <label htmlFor="recipient" className="block text-sm font-medium text-white">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="SP... or ST..."
            className="block w-full px-4 py-3 border-2 rounded-lg text-sm font-mono bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none border-neutral-600"
            required
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium text-white">
            Amount (STX)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000000"
              className="block w-full pl-10 pr-20 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none border-neutral-600"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-neutral-400 sm:text-sm font-medium">STX</span>
            </div>
          </div>
        </div>


        {/* Transaction Preview */}
        {recipientAddress && amount && ownerAddress && (
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              Delegated Transaction Preview
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Delegation Owner:</span>
                <span className="text-white font-mono">{formatAddress(ownerAddress)}</span>
              </div>
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Agent (Delegate):</span>
                <span className="text-purple-400 font-mono">{activeAgent.name}</span>
              </div>
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Final Recipient:</span>
                <span className="text-white font-mono">{formatAddress(recipientAddress)}</span>
              </div>
              <div className="border-t border-neutral-600 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Amount:</span>
                  <span className="text-orange-400 font-bold">{amount} STX</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading || !recipientAddress || !amount || !ownerAddress || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Spending Delegated Funds...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Spend Delegated STX
            </>
          )}
        </Button>
      </form>

      {/* Autonomous Delegated Spending Info */}
      <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
        <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
          🤖 Autonomous Delegated Spending
        </h4>
        <div className="text-sm text-orange-200/80 space-y-1">
          <div>• Agent creates and signs contract call transaction independently</div>
          <div>• Uses agent's own private key - no wallet popup required</div>
          <div>• Calls delegation contract's spend-delegated function</div>
          <div>• Subject to daily limits and delegation expiry controls</div>
          <div>• Complete autonomous operation by the AI agent</div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>How delegated spending works:</strong> The agent uses its private key to sign a transaction 
        that spends from the delegation created by the owner. The agent pays gas fees from its own funded wallet 
        (2 STX provided during creation). The STX being sent comes from the owner's delegation, not the agent's balance.
      </div>
    </div>
  );
};

export default AgentTransaction;