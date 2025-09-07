import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAgent } from './AgentContext';
import { STXToMicroSTX, formatAddress, formatSTX } from './contract';
import { DelegationContract } from '../delegation/contract';
import { Shield, Bot, DollarSign, Calendar, Zap, ArrowRight } from 'lucide-react';

interface AgentDelegationProps {
  walletAddress: string | null;
  isWalletConnected: boolean;
  onSuccess?: () => void;
}

const AgentDelegation: React.FC<AgentDelegationProps> = ({ 
  walletAddress, 
  isWalletConnected, 
  onSuccess 
}) => {
  const { agents, updateAgent, isLoading } = useAgent();
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [delegationAmount, setDelegationAmount] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [duration, setDuration] = useState('7'); // 7 days
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
  const availableAgents = agents.filter(agent => agent.isActive);

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !delegationAmount || !dailyLimit || !duration || !walletAddress) return;

    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
    if (!selectedAgent) return;

    setIsSubmitting(true);
    try {
      const microSTXAmount = STXToMicroSTX(parseFloat(delegationAmount));
      const microSTXDailyLimit = STXToMicroSTX(parseFloat(dailyLimit));
      const durationDays = parseInt(duration);

      // Use the existing delegation contract to delegate STX to the agent's address
      await DelegationContract.createDelegationAndDeposit(
        selectedAgent.address, // Delegate to the agent's STX address
        microSTXAmount,
        microSTXDailyLimit,
        durationDays,
        walletAddress // The user's connected wallet address
      );
      
      // Update agent delegation status in local storage
      updateAgent(selectedAgentId, {
        delegatedAmount: microSTXAmount,
        delegationStatus: 'pending'
      });
      
      // Reset form
      setSelectedAgentId('');
      setDelegationAmount('');
      setDailyLimit('');
      setDuration('7');
      
      alert('Delegation created successfully! Transaction submitted to the blockchain.');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to delegate to agent:', error);
      alert(`Failed to delegate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="p-6 text-center">
        <div className="text-orange-400 mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-white mb-2">Wallet Not Connected</h3>
        <p className="text-neutral-400">
          Please connect your wallet to delegate STX to agents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Delegate to Agent</h2>
          <p className="text-neutral-400">Give your AI agents controlled spending power</p>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-400 mb-1">Your Wallet</p>
            <p className="text-white font-mono">{formatAddress(walletAddress || '')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-400">Connected</p>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {availableAgents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Active Agents</h3>
          <p className="text-neutral-400">
            Create and activate agents before delegating funds to them.
          </p>
        </div>
      ) : (
        <form onSubmit={handleDelegate} className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <label htmlFor="agent" className="block text-sm font-medium text-white">
              Select Agent
            </label>
            <select
              id="agent"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="block w-full px-4 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
              required
            >
              <option value="">Choose an agent to delegate to...</option>
              {availableAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({formatAddress(agent.address)})
                  {agent.delegationStatus !== 'none' && ` - ${agent.delegationStatus}`}
                </option>
              ))}
            </select>
          </div>

          {/* Delegation Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-white">
              Total Delegation Amount (STX)
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
                value={delegationAmount}
                onChange={(e) => setDelegationAmount(e.target.value)}
                placeholder="0.000000"
                className="block w-full pl-10 pr-20 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-neutral-400 sm:text-sm font-medium">STX</span>
              </div>
            </div>
          </div>

          {/* Daily Spending Limit */}
          <div className="space-y-2">
            <label htmlFor="dailyLimit" className="block text-sm font-medium text-white">
              Daily Spending Limit (STX)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Zap className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="dailyLimit"
                type="number"
                step="0.000001"
                min="0"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="0.000000"
                className="block w-full pl-10 pr-20 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-neutral-400 sm:text-sm font-medium">STX/day</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium text-white">
              Delegation Duration
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-neutral-400" />
              </div>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full pl-10 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
                required
              >
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">1 Week</option>
                <option value="30">1 Month</option>
                <option value="90">3 Months</option>
              </select>
            </div>
          </div>

          {/* Delegation Preview */}
          {selectedAgent && delegationAmount && dailyLimit && (
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                Delegation Preview
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">From:</span>
                  <span className="text-white font-mono">{formatAddress(walletAddress || '')}</span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">To Agent:</span>
                  <span className="text-white font-mono">{selectedAgent.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Agent Address:</span>
                  <span className="text-white font-mono">{formatAddress(selectedAgent.address)}</span>
                </div>
                <div className="border-t border-neutral-600 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Total Amount:</span>
                    <span className="text-orange-400 font-bold">{delegationAmount} STX</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Daily Limit:</span>
                    <span className="text-yellow-400 font-bold">{dailyLimit} STX</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Duration:</span>
                    <span className="text-blue-400 font-bold">
                      {duration === '1' && '1 Day'}
                      {duration === '3' && '3 Days'}
                      {duration === '7' && '1 Week'}
                      {duration === '30' && '1 Month'}
                      {duration === '90' && '3 Months'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || !selectedAgentId || !delegationAmount || !dailyLimit}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Delegation...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Delegate STX to Agent
              </>
            )}
          </Button>
        </form>
      )}

      {/* Delegation Info */}
      <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
        <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
          🛡️ Delegation Security
        </h4>
        <div className="text-sm text-orange-200/80 space-y-1">
          <div>• Agent can only spend within the daily limits you set</div>
          <div>• Delegation expires automatically after the specified duration</div>
          <div>• Agent cannot spend more than the total delegated amount</div>
          <div>• You maintain full control and can revoke delegation anytime</div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>How delegation works:</strong> When you delegate STX to an agent, you're giving it permission 
        to spend up to the daily limit from the total amount you specify. The agent can make transactions 
        autonomously within these constraints. The delegation will expire after the specified duration.
      </div>
    </div>
  );
};

export default AgentDelegation;