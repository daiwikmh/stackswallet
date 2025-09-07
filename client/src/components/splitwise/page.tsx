"use client";

import { useState, useEffect } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { SplitwiseContract, formatSTX } from './contract';
import { SplitwiseProvider } from './SplitwiseContext';
import { getConnectedStxAddress } from '../../utils/wallet';
import CreateExpense from './CreateExpense';
import ApproveExpense from './ApproveExpense';
import ExpenseList from './ExpenseList';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, CheckCircle, List, Users, DollarSign, Shield } from 'lucide-react';

interface SplitwisePageProps {
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export default function SplitwisePage({ 
  walletAddress, 
  isWalletConnected 
}: SplitwisePageProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [userIsMember, setUserIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'create', label: 'CREATE EXPENSE', icon: Plus },
    { id: 'approve', label: 'APPROVE', icon: CheckCircle },
    { id: 'list', label: 'ALL EXPENSES', icon: List },
  ];

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [group, isMember] = await Promise.all([
          SplitwiseContract.getGroupInfo(),
          walletAddress ? SplitwiseContract.isGroupMember(walletAddress) : Promise.resolve(false)
        ]);
        
        setGroupInfo(group);
        setUserIsMember(isMember);
      } catch (error) {
        console.error('Failed to fetch group data:', error);
        setGroupInfo(null);
        setUserIsMember(false);
      }
    };

    if (isWalletConnected && walletAddress) {
      fetchGroupData();
    } else {
      setGroupInfo(null);
      setUserIsMember(false);
    }
  }, [isWalletConnected, walletAddress]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [group, isMember] = await Promise.all([
        SplitwiseContract.getGroupInfo(),
        walletAddress ? SplitwiseContract.isGroupMember(walletAddress) : Promise.resolve(false)
      ]);
      
      setGroupInfo(group);
      setUserIsMember(isMember);
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
            <p className="text-neutral-400">Connect your Stacks wallet to access split payment features</p>
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
            <h1 className="text-2xl font-bold text-white mb-2">SPLIT PAYMENTS</h1>
            <p className="text-neutral-400">
              Share expenses with friends using secure multisig transactions
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Group Balance
            </p>
            <p className="text-sm text-white font-mono">
              {groupInfo ? formatSTX(groupInfo.balance) : '0.000000 STX'}
            </p>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Membership
            </p>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${userIsMember ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <p className="text-sm text-white font-medium">
                {userIsMember ? 'MEMBER' : 'NOT MEMBER'}
              </p>
            </div>
          </div>
        </div>

        {/* Group Info */}
        {groupInfo && (
          <div className="bg-neutral-800 border border-neutral-700 rounded p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-white">Group Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-neutral-400 mb-1">Total Members</p>
                <p className="text-white font-medium">{groupInfo.membersCount}</p>
              </div>
              <div>
                <p className="text-neutral-400 mb-1">Approval Threshold</p>
                <p className="text-white font-medium">{groupInfo.approvalThreshold} approvals required</p>
              </div>
              <div>
                <p className="text-neutral-400 mb-1">Total Transactions</p>
                <p className="text-white font-medium">{groupInfo.transactionNonce}</p>
              </div>
            </div>
          </div>
        )}

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

        {/* Non-member Warning */}
        {isWalletConnected && walletAddress && groupInfo && !userIsMember && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-orange-500 mr-3">ℹ️</div>
              <div>
                <h3 className="text-sm font-medium text-orange-400">NOT A GROUP MEMBER</h3>
                <p className="text-sm text-orange-300/70 mt-1">
                  You are not a member of the split payment group. You can view expenses but cannot create or approve them. 
                  Ask an existing member to add you to the group.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Group Warning */}
        {isWalletConnected && walletAddress && !groupInfo && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-500 mr-3">❌</div>
              <div>
                <h3 className="text-sm font-medium text-red-400">NO GROUP FOUND</h3>
                <p className="text-sm text-red-300/70 mt-1">
                  No split payment group has been initialized yet. Someone needs to create the group first using the multisig setup.
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
      <SplitwiseProvider 
        walletAddress={walletAddress} 
        isWalletConnected={isWalletConnected}
      >
        <div className="bg-neutral-800 border border-neutral-700 rounded">
          <div className="p-6">
            {activeTab === 'create' && (
              <CreateExpense onSuccess={refreshData} />
            )}
            {activeTab === 'approve' && (
              <ApproveExpense onSuccess={refreshData} />
            )}
            {activeTab === 'list' && (
              <ExpenseList onRefresh={refreshData} />
            )}
          </div>
        </div>
      </SplitwiseProvider>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          CONTRACT: 
          <span className="font-mono ml-1 text-neutral-400 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
            ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.multisig
          </span>
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          Split payments built on secure multisig infrastructure
        </p>
      </div>
    </div>
  );
}