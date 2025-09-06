import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { DelegationContract, formatSTX, STXToMicroSTX } from './contract';
import StacksWalletConnect from '../StacksWalletConnect';
import CreateDelegation from './CreateDelegation';
import ManageDelegation from './ManageDelegation';
import DelegationList from './DelegationList';
import SpendDelegated from './SpendDelegated';

interface TabProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ id, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
      isActive
        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

const DelegationPage: React.FC = () => {
  const { isWalletConnected, selectedAddress, addresses, connectWallet } = useStacksWallet();
  const [activeTab, setActiveTab] = useState('create');
  const [contractBalance, setContractBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'create', label: 'Create Delegation' },
    { id: 'manage', label: 'Manage Delegations' },
    { id: 'spend', label: 'Spend Delegated' },
    { id: 'list', label: 'All Delegations' },
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

    if (isWalletConnected && selectedAddress) {
      fetchContractBalance();
    } else {
      // Reset data when wallet disconnects
      setContractBalance(0);
    }
  }, [isWalletConnected, selectedAddress]);

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

  // Helper function to check if wallet is truly ready
  const isWalletReady = () => {
    return isWalletConnected && selectedAddress && selectedAddress.trim() !== '';
  };

  if (!isWalletReady()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Stacks Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              To access delegation features, please connect your Stacks wallet first.
            </p>
            <StacksWalletConnect 
              variant="default"
              size="lg"
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Stacks Delegation
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage delegated STX spending with daily limits and time-based controls
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <StacksWalletConnect 
                  variant="outline" 
                  showAddress={true}
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Wallet Status</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isWalletConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-sm text-gray-900">
                    {isWalletConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Connected Address</p>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-1 rounded mt-1">
                  {selectedAddress || 'No address found'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Contract Balance</p>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-1 rounded mt-1">
                  {formatSTX(contractBalance)}
                </p>
              </div>
            </div>
            
            {/* Debug Info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>isWalletConnected: {JSON.stringify(isWalletConnected)}</p>
                <p>selectedAddress: {JSON.stringify(selectedAddress)}</p>
                <p>addresses: {JSON.stringify(addresses)}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
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

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Contract Address: 
            <span className="font-mono ml-1 bg-gray-100 px-2 py-1 rounded">
              ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.delegation
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DelegationPage;