"use client";

import { useState, useEffect } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { AgentProvider } from './AgentContext';
import { getConnectedStxAddress } from '../../utils/wallet';
import CreateAgent from './CreateAgent';
import AgentManager from './AgentManager';
import AgentTransaction from './AgentTransaction';
import AgentDelegation from './AgentDelegation';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bot, Plus, Settings, Send, Shield, Sparkles, Cpu } from 'lucide-react';
import { useAgent } from './AgentContext';

interface AgentPageProps {
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export default function AgentPage({ 
  walletAddress, 
  isWalletConnected 
}: AgentPageProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'create', label: 'CREATE AGENT', icon: Plus },
    { id: 'manage', label: 'MANAGE', icon: Settings },
    { id: 'transaction', label: 'TRANSACTIONS', icon: Send },
    { id: 'delegate', label: 'DELEGATION', icon: Shield },
  ];

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Refresh any necessary data
      console.log('🔄 Refreshing agent data...');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="p-6 bg-neutral-900 min-h-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">WALLET CONNECTION REQUIRED</h3>
            <p className="text-neutral-400">Connect your Stacks wallet to create and manage AI agents</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-900 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                AI AGENT SYSTEM
                <Sparkles className="w-5 h-5 text-purple-400" />
              </h1>
              <p className="text-neutral-400">
                Create autonomous AI agents with their own wallets and spending power
              </p>
            </div>
          </div>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-purple-500"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 p-6 rounded-lg border border-purple-500/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Independent Wallets</h3>
              <p className="text-neutral-400 text-sm">Each agent gets its own private key and Stacks address</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Autonomous Transactions</h3>
              <p className="text-neutral-400 text-sm">Agents can send STX and interact with contracts independently</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Controlled Delegation</h3>
              <p className="text-neutral-400 text-sm">Delegate funds with daily limits and time constraints</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-800 border border-neutral-700 rounded p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content with single AgentProvider */}
      <AgentProvider walletAddress={walletAddress} isWalletConnected={isWalletConnected}>
        {/* Stats Cards */}
        <AgentStatsCards />
        <div className="bg-neutral-800 border border-neutral-700 rounded">
          <div className="p-6">
            {activeTab === 'create' && (
              <CreateAgent onSuccess={refreshData} />
            )}
            {activeTab === 'manage' && (
              <AgentManager onSuccess={refreshData} />
            )}
            {activeTab === 'transaction' && (
              <AgentTransaction onSuccess={refreshData} />
            )}
            {activeTab === 'delegate' && (
              <AgentDelegation 
                walletAddress={walletAddress}
                isWalletConnected={isWalletConnected}
                onSuccess={refreshData} 
              />
            )}
          </div>
        </div>
      </AgentProvider>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          POWERED BY: 
          <span className="font-mono ml-1 text-neutral-400 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
            @stacks/wallet-sdk • @stacks/transactions
          </span>
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          AI agents with autonomous wallet capabilities on Stacks blockchain
        </p>
      </div>
    </div>
  );
}

// Stats Cards Component
function AgentStatsCards() {
  const { agents, activeAgent, transactions } = useAgent();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Agents</p>
        <p className="text-2xl font-bold text-white">{agents.length}</p>
      </div>
      
      <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Active Agents</p>
        <p className="text-2xl font-bold text-green-400">{agents.filter((a: any) => a.isActive).length}</p>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Selected Agent</p>
        <p className="text-sm font-medium text-purple-400">
          {activeAgent ? activeAgent.name : 'None'}
        </p>
      </div>

      <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Transactions</p>
        <p className="text-2xl font-bold text-blue-400">{transactions.length}</p>
      </div>
    </div>
  );
}