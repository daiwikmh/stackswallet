import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { MultisigContract, formatSTX } from './contract';
import StacksWalletConnect from '../StacksWalletConnect';
import InitializeWallet from './InitializeWallet';
import DepositFunds from './DepositFunds';
import ProposeTransaction from './ProposeTransaction';
import TransactionList from './TransactionList';
import ManageOwners from './ManageOwners';
import { MultisigProvider } from './MultisigContext';
import { getConnectedStxAddress } from '../../utils/wallet';
import { Shield, PiggyBank, Send, FileText, Users, RefreshCw } from 'lucide-react';

interface TabProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
      isActive
        ? 'border-b-2 border-orange-500 text-orange-500 bg-orange-500/10'
        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
    }`}
  >
    {label}
  </button>
);

const MultisigPage: React.FC = () => {
  const { isWalletConnected, selectedAddress } = useStacksWallet();
  const [activeTab, setActiveTab] = useState('initialize');
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [properAddress, setProperAddress] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const tabs = [
    { id: 'initialize', label: 'Initialize', icon: Shield },
    { id: 'deposit', label: 'Deposit', icon: PiggyBank },
    { id: 'propose', label: 'Propose', icon: Send },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'owners', label: 'Owners', icon: Users },
  ];

  useEffect(() => {
    const initializeWalletData = async () => {
      if (isWalletConnected) {
        // Primary: use selectedAddress from context
        if (selectedAddress) {
          console.log('✅ Multisig using selectedAddress from context:', selectedAddress);
          setProperAddress(selectedAddress);
        } else {
          // Fallback: get address from Stacks Connect storage
          console.log('🔄 Multisig: No selectedAddress, trying to get from storage...');
          const storageAddress = await getConnectedStxAddress();
          if (storageAddress) {
            console.log('✅ Multisig retrieved address from storage:', storageAddress);
            setProperAddress(storageAddress);
          } else {
            console.log('⚠️ Multisig: No valid address found');
            setProperAddress(null);
          }
        }
        
        await fetchWalletInfo();
      } else {
        // Reset data when wallet disconnects
        setWalletInfo(null);
        setProperAddress(null);
        setIsInitialized(false);
      }
    };

    initializeWalletData();
  }, [isWalletConnected, selectedAddress]);

  const fetchWalletInfo = async () => {
    setIsLoading(true);
    try {
      const info = await MultisigContract.getWalletInfo();
      setWalletInfo(info);
      
      // Check if wallet is initialized (has owners)
      if (info && info.ownersCount > 0) {
        setIsInitialized(true);
        // Switch to transactions tab if on initialize tab and wallet is already initialized
        if (activeTab === 'initialize') {
          setActiveTab('transactions');
        }
      } else {
        setIsInitialized(false);
        setActiveTab('initialize');
      }
    } catch (error) {
      console.error('Failed to fetch wallet info:', error);
      setWalletInfo(null);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchWalletInfo();
  };

  // Helper function to check if wallet is truly ready
  const isWalletReady = () => {
    return isWalletConnected && !!properAddress;
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-500"
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
            <h2 className="text-2xl font-bold text-white mb-2">
              Connect Your Stacks Wallet
            </h2>
            <p className="text-neutral-400 mb-6">
              To access multisig wallet features, please connect your Stacks wallet first.
            </p>
            <StacksWalletConnect 
              variant="default"
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-neutral-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Multisig Wallet
                </h1>
                <p className="text-neutral-400 mt-2">
                  Secure multi-signature wallet for collaborative fund management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <StacksWalletConnect 
                  variant="outline" 
                  showAddress={true}
                  className="border-neutral-600 text-white hover:bg-neutral-800"
                />
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="p-6 bg-neutral-800 border-b border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-400">Wallet Status</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isWalletConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-sm text-white">
                    {isWalletConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Connected Address</p>
                <p className={`text-sm font-mono bg-neutral-900 border border-neutral-600 px-3 py-1 rounded mt-1 ${
                  properAddress ? 'text-white' : 'text-red-400'
                }`}>
                  {properAddress || 'No address detected'}
                </p>
                {properAddress && selectedAddress !== properAddress && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Using address from wallet addresses array
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Contract Balance</p>
                <p className="text-sm text-white font-mono bg-neutral-900 border border-neutral-600 px-3 py-1 rounded mt-1">
                  {walletInfo ? formatSTX(walletInfo.balance) : '0.000000 STX'}
                </p>
              </div>
            </div>

            {/* Debug Info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded text-xs">
                <p className="text-orange-400"><strong>Debug Info:</strong></p>
                <p className="text-neutral-300">isWalletConnected: {JSON.stringify(isWalletConnected)}</p>
                <p className="text-neutral-300">selectedAddress: {JSON.stringify(selectedAddress)}</p>
                <p className="text-neutral-300">properAddress: {JSON.stringify(properAddress)}</p>
                <p className="text-neutral-300">isInitialized: {JSON.stringify(isInitialized)}</p>
              </div>
            )}

            {/* Additional wallet info when initialized */}
            {isInitialized && walletInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-700">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Owners</p>
                  <p className="text-lg font-bold text-white">{walletInfo.ownersCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">Approval Threshold</p>
                  <p className="text-lg font-bold text-white">
                    {walletInfo.approvalThreshold}/{walletInfo.ownersCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Transactions</p>
                  <p className="text-lg font-bold text-white">{walletInfo.transactionNonce}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-700 overflow-x-auto">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Address Warning */}
        {isWalletConnected && !properAddress && (
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-orange-400 mr-3">
                ⚠️
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-400">
                  Address Not Detected
                </h3>
                <p className="text-sm text-neutral-300 mt-1">
                  Wallet is connected but no address was detected. Some features may not work properly. 
                  Try disconnecting and reconnecting your wallet.
                </p>
                <div className="mt-2 text-xs text-neutral-400 bg-neutral-800 p-2 rounded">
                  Debug: selectedAddress={JSON.stringify(selectedAddress)}, properAddress={JSON.stringify(properAddress)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <MultisigProvider 
          walletAddress={properAddress} 
          isWalletConnected={isWalletConnected}
        >
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-sm">
            <div className="p-6">
              {activeTab === 'initialize' && (
                <InitializeWallet onSuccess={refreshData} />
              )}
              {activeTab === 'deposit' && (
                <DepositFunds onSuccess={refreshData} />
              )}
              {activeTab === 'propose' && (
                <ProposeTransaction onSuccess={refreshData} />
              )}
              {activeTab === 'transactions' && (
                <TransactionList onRefresh={refreshData} />
              )}
              {activeTab === 'owners' && (
                <ManageOwners onRefresh={refreshData} />
              )}
            </div>
          </div>
        </MultisigProvider>

        {/* Footer */}
        <div className="mt-8 text-center text-neutral-500 text-sm">
          <p>
            Contract Address: 
            <span className="font-mono ml-1 bg-neutral-800 border border-neutral-600 text-neutral-300 px-2 py-1 rounded">
              ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.multisig
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultisigPage;