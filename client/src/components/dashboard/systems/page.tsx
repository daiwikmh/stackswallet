import React from 'react';
import PythPriceLogger from '../../feeds/PythPriceLogger';
import StacksWalletConnect from '../../StacksWalletConnect';
import { useStacksWallet } from '../../../contexts/StacksWalletContext';

const SystemsPage: React.FC = () => {
  const { isWalletConnected, selectedAddress } = useStacksWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔧 Systems Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Monitor and interact with blockchain oracles and price feeds
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StacksWalletConnect 
                showAddress={true}
                variant="outline"
              />
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isWalletConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isWalletConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            {isWalletConnected ? 'Connected' : 'Disconnected'}
            {isWalletConnected && selectedAddress && typeof selectedAddress === 'string' && (
              <span className="ml-2 text-xs opacity-75">
                • {selectedAddress.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>

        {/* Systems Grid */}
        <div className="space-y-8">
          {/* Pyth Oracle Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">📊 Price Oracles</h2>
              <p className="text-sm text-gray-600 mt-1">
                Real-time price feeds from Pyth Network
              </p>
            </div>
            <div className="p-6">
              <PythPriceLogger />
            </div>
          </div>

          {/* Placeholder for future systems */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">🔮 Coming Soon</h2>
              <p className="text-sm text-gray-600 mt-1">
                Additional oracle systems and integrations
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                <p className="text-gray-500">More systems will be added here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemsPage;
