import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAgent } from './AgentContext';
import { formatAddress, formatSTX } from './contract';
import { 
  Bot, 
  Copy, 
  Trash2, 
  Settings, 
  Power, 
  PowerOff, 
  Wallet, 
  Send,
  Shield,
  AlertCircle
} from 'lucide-react';

interface AgentManagerProps {
  onSuccess?: () => void;
}

const AgentManager: React.FC<AgentManagerProps> = ({ onSuccess }) => {
  const { agents, activeAgent, selectAgent, updateAgent, deleteAgent, isLoading } = useAgent();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleToggleAgent = (agentId: string, currentStatus: boolean) => {
    updateAgent(agentId, { isActive: !currentStatus });
  };

  const handleDeleteAgent = (agentId: string) => {
    if (showDeleteConfirm === agentId) {
      deleteAgent(agentId);
      setShowDeleteConfirm(null);
      onSuccess?.();
    } else {
      setShowDeleteConfirm(agentId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Agent Management</h2>
          <p className="text-neutral-400">Manage and configure your AI agents</p>
        </div>
      </div>

      {/* Agent Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Total Agents</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{agents.length}</div>
        </div>
        
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Active Agents</span>
            <Power className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {agents.filter(agent => agent.isActive).length}
          </div>
        </div>
        
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Delegated Agents</span>
            <Shield className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {agents.filter(agent => agent.delegationStatus === 'active').length}
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Agents Created</h3>
            <p className="text-neutral-400 mb-4">Create your first AI agent to get started!</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-neutral-800 border rounded-lg p-6 transition-all duration-200 ${
                activeAgent?.id === agent.id
                  ? 'border-purple-500 bg-purple-500/5'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Agent Avatar */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    agent.isActive 
                      ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' 
                      : 'bg-neutral-700'
                  }`}>
                    <Bot className={`w-6 h-6 ${
                      agent.isActive ? 'text-purple-400' : 'text-neutral-500'
                    }`} />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {agent.name}
                      </h3>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-neutral-600 text-neutral-300'
                      }`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>

                      {/* Delegation Status */}
                      {agent.delegationStatus !== 'none' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.delegationStatus === 'active'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {agent.delegationStatus === 'active' ? 'Delegated' : 'Pending'}
                        </span>
                      )}

                      {/* Active Agent Indicator */}
                      {activeAgent?.id === agent.id && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-mono text-neutral-300">
                        {formatAddress(agent.address)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyAddress(agent.address)}
                        className="h-6 px-2 text-neutral-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Balance Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-400">Balance: </span>
                        <span className="text-white font-mono">
                          {formatSTX(agent.balance)}
                        </span>
                      </div>
                      {agent.delegatedAmount && (
                        <div>
                          <span className="text-neutral-400">Delegated: </span>
                          <span className="text-orange-400 font-mono">
                            {formatSTX(agent.delegatedAmount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-neutral-500 mt-2">
                      Created: {agent.createdAt.toLocaleDateString()} {agent.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Select Agent */}
                  {activeAgent?.id !== agent.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAgent(agent.id)}
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                    >
                      Select
                    </Button>
                  )}

                  {/* Toggle Active/Inactive */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAgent(agent.id, agent.isActive)}
                    className={`${
                      agent.isActive
                        ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                        : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {agent.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </Button>

                  {/* Delete Agent */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                    className={`${
                      showDeleteConfirm === agent.id
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-500/30'
                        : 'text-neutral-400 hover:text-red-400 hover:bg-red-900/20'
                    }`}
                  >
                    {showDeleteConfirm === agent.id ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === agent.id && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-400 mb-3">
                    Are you sure you want to delete this agent? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(null)}
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete Agent
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>Agent Management:</strong> Select an agent to make it active for transactions. 
        Inactive agents won't process any transactions. Deleting an agent will remove it permanently 
        from your system (make sure to backup any important data first).
      </div>
    </div>
  );
};

export default AgentManager;