"use client";

import { useState, useEffect } from 'react';
import { useStacksWallet } from '../../../../contexts/StacksWalletContext';
import { DelegationContract, formatSTX } from '../../../delegation/contract';
import { DelegationProvider } from '../../../delegation/DelegationContext';
import { getConnectedStxAddress } from '../../../../utils/wallet';
import CreateDelegation from '../../../delegation/CreateDelegation';
import ManageDelegation from '../../../delegation/ManageDelegation';
import DelegationList from '../../../delegation/DelegationList';
import SpendDelegated from '../../../delegation/SpendDelegated';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Settings, Send, List } from 'lucide-react';

interface DelegationDashboardPageProps {
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export default function DelegationDashboardPage({ 
  walletAddress, 
  isWalletConnected 
}: DelegationDashboardPageProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [contractBalance, setContractBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'create', label: 'CREATE', icon: Plus },
    { id: 'manage', label: 'MANAGE', icon: Settings },
    { id: 'spend', label: 'SPEND', icon: Send },
    { id: 'list', label: 'ALL DELEGATIONS', icon: List },
  ];

  useEffect(() => {
    const fetchContractBalance = async () => {
      try {
        const balance = await DelegationContract.getContractBalance();
        setContractBalance(balance);
      } catch (error) {
        console.error('Failed to fetch contract balance:', error);
        setContractBalance(0);
      }
    };

    if (isWalletConnected && walletAddress) {
      fetchContractBalance();
    } else {
      setContractBalance(0);
    }
  }, [isWalletConnected, walletAddress]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const balance = await DelegationContract.getContractBalance();
      setContractBalance(balance);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="p-6 bg-neutral-900 min-h-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">WALLET CONNECTION REQUIRED</h3>
            <p className="text-neutral-400">Connect your Stacks wallet to access delegation features</p>
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
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">STACKS DELEGATION</h1>
            <p className="text-neutral-400">
              Manage delegated STX spending with daily limits and time-based controls
            </p>
          </div>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-orange-500"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Wallet Status</p>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isWalletConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm text-white font-medium">
                {isWalletConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Connected Address</p>
            <p className={`text-sm font-mono ${walletAddress ? 'text-white' : 'text-red-400'}`}>
              {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : 'NO ADDRESS'}
            </p>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Contract Balance</p>
            <p className="text-sm text-white font-mono">
              {formatSTX(contractBalance)}
            </p>
          </div>
        </div>

        {/* Address Warning */}
        {isWalletConnected && !walletAddress && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-yellow-500 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-yellow-400">ADDRESS NOT DETECTED</h3>
                <p className="text-sm text-yellow-300/70 mt-1">
                  Wallet is connected but no address was detected. Try disconnecting and reconnecting your wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-800 border border-neutral-700 rounded p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <DelegationProvider 
        walletAddress={walletAddress} 
        isWalletConnected={isWalletConnected}
      >
        <div className="bg-neutral-800 border border-neutral-700 rounded">
          <div className="p-6">
            {activeTab === 'create' && (
              <CreateDelegation onSuccess={refreshData} />
            )}
            {activeTab === 'manage' && (
              <ManageDelegation onSuccess={refreshData} />
            )}
            {activeTab === 'spend' && (
              <SpendDelegated onSuccess={refreshData} />
            )}
            {activeTab === 'list' && (
              <DelegationList onRefresh={refreshData} />
            )}
          </div>
        </div>
      </DelegationProvider>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          CONTRACT: 
          <span className="font-mono ml-1 text-neutral-400 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
            ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.delegation
          </span>
        </p>
      </div>
    </div>
  );
}