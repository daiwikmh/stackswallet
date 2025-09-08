import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAgent } from './AgentContext';
import { Plus, Bot, Sparkles, Zap } from 'lucide-react';

interface CreateAgentProps {
  onSuccess?: () => void;
}

const CreateAgent: React.FC<CreateAgentProps> = ({ onSuccess }) => {
  const { createAgent, isLoading } = useAgent();
  const [agentName, setAgentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    setIsCreating(true);
    try {
      await createAgent(agentName.trim());
      setAgentName('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create AI Agent</h2>
          <p className="text-neutral-400">Generate an autonomous wallet with its own identity</p>
        </div>
      </div>

      <form onSubmit={handleCreateAgent} className="space-y-6">
        {/* Agent Name */}
        <div className="space-y-2">
          <label htmlFor="agentName" className="block text-sm font-medium text-white">
            Agent Name
          </label>
          <input
            id="agentName"
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Enter agent name (e.g., Trading Bot, Payment Assistant)"
            className="block w-full px-4 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none border-neutral-600"
            required
            disabled={isLoading || isCreating}
          />
        </div>

        {/* Features Info */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            Agent Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Independent wallet identity</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Autonomous transaction signing</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Zap className="w-4 h-4 text-green-400" />
                <span>STX sending & receiving</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Zap className="w-4 h-4 text-orange-400" />
                <span>Delegation spending powers</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>Smart contract interactions</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Secure key management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Funding Notice */}
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
            💰 Agent Funding Process
          </h4>
          <div className="text-sm text-green-200/80 space-y-1">
            <div>• Your connected Stacks wallet will send 2 STX to the agent's address</div>
            <div>• Agent address is generated from its unique private key and public key</div>
            <div>• Transaction uses your connected wallet as sender, agent address as recipient</div>
            <div>• You'll see a wallet popup to confirm the 2 STX funding transaction</div>
            <div>• Check console logs for debugging wallet connection issues</div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
          <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
            🔐 Security Information
          </h4>
          <div className="text-sm text-orange-200/80 space-y-1">
            <div>• Agent wallets are generated with secure 24-word mnemonics</div>
            <div>• Private keys are stored locally in your browser</div>
            <div>• Each agent has its own unique Stacks address</div>
            <div>• Agents can only spend funds you delegate to them + initial gas funds</div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          type="submit"
          disabled={!agentName.trim() || isLoading || isCreating}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
          size="lg"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Agent...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create AI Agent
            </>
          )}
        </Button>
      </form>

      {/* Additional Info */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>How it works:</strong> When you create an agent, a new Stacks wallet is generated with its own 
        private key and address. Your wallet automatically sends 2 STX to the agent for gas fees, then you can 
        delegate additional STX for the agent to spend autonomously. The agent can now sign and broadcast its 
        own transactions without requiring your wallet confirmation.
      </div>
    </div>
  );
};

export default CreateAgent;