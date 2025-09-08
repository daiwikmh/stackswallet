"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bot, Plus, Settings, Send, Shield, Sparkles, Cpu, User, Wrench } from 'lucide-react';
import { AgentProvider } from './AgentContext';
import { useAgent } from './AgentContext';
import CreateAgent from './CreateAgent';
import AgentManager from './AgentManager';
import AgentTransaction from './AgentTransaction';
import AgentDelegation from './AgentDelegation';

interface ManualAgentPageProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
}

export default function ManualAgentPage({ walletAddress, isWalletConnected }: ManualAgentPageProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  const tabs = [
    { id: 'create', label: 'CREATE AGENT', icon: Plus },
    { id: 'manage', label: 'MANAGE', icon: Settings },
    { id: 'transactions', label: 'TRANSACTIONS', icon: Send },
    { id: 'delegation', label: 'DELEGATION', icon: Shield },
  ];

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Refresh any necessary data
      console.log('🔄 Refreshing manual agent data...');
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">WALLET CONNECTION REQUIRED</h3>
            <p className="text-neutral-400">Connect your Stacks wallet to create and manage manual agents</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                MANUAL AGENT CONTROL
                <User className="w-5 h-5 text-blue-400" />
              </h1>
              <p className="text-neutral-400">
                Manually control AI agents with direct oversight and intervention
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isWalletConnected ? "default" : "secondary"} className="bg-blue-500/20 text-blue-500">
              {isWalletConnected ? "Connected" : "Disconnected"}
            </Badge>
            {walletAddress && (
              <Badge variant="outline" className="font-mono text-xs">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </Badge>
            )}
            <Button
              onClick={refreshData}
              disabled={isLoading}
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-blue-500"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-6 rounded-lg border border-blue-500/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Manual Override</h3>
              <p className="text-neutral-400 text-sm">Direct control over agent actions and decisions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Custom Configuration</h3>
              <p className="text-neutral-400 text-sm">Fine-tune agent parameters and behavior</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Enhanced Security</h3>
              <p className="text-neutral-400 text-sm">Manual approval for sensitive operations</p>
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
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>


      {/* Content with AgentProvider */}
      <AgentProvider walletAddress={walletAddress} isWalletConnected={isWalletConnected}>
        {/* Stats Cards */}
        <AgentStatsCards />
        
        <div className="bg-neutral-800 border border-neutral-700 rounded">
          <div className="p-6">
            {activeTab === 'create' && <CreateAgent onSuccess={refreshData} />}
            {activeTab === 'manage' && <AgentManager onSuccess={refreshData} />}
            {activeTab === 'transactions' && <AgentTransaction onSuccess={refreshData} />}
            {activeTab === 'delegation' && (
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
          MANUAL CONTROL: 
          <span className="font-mono ml-1 text-neutral-400 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
            Human-in-the-loop • Enhanced Security
          </span>
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          Direct oversight and control over AI agent operations
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
        <p className="text-sm font-medium text-blue-400">
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