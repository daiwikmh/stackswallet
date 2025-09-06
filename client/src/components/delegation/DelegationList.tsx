import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { DelegationContract, formatSTX, DelegationStatus } from './contract';

interface DelegationListProps {
  onRefresh: () => void;
}

interface DelegationEntry {
  owner: string;
  delegate: string;
  status: DelegationStatus | null;
  isLoading: boolean;
}

const DelegationList: React.FC<DelegationListProps> = ({ onRefresh }) => {
  const { selectedAddress } = useStacksWallet();
  const [delegations, setDelegations] = useState<DelegationEntry[]>([]);
  const [searchOwner, setSearchOwner] = useState('');
  const [searchDelegate, setSearchDelegate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sample delegations for demonstration - in a real app, you'd fetch these from an API or indexer
  const sampleDelegations = [
    { owner: selectedAddress || '', delegate: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE' },
    { owner: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', delegate: selectedAddress || '' },
  ];

  const loadDelegationStatus = async (owner: string, delegate: string): Promise<DelegationStatus | null> => {
    try {
      const status = await DelegationContract.getDelegationStatus(owner, delegate);
      return status;
    } catch (error) {
      console.error('Failed to load delegation status:', error);
      return null;
    }
  };

  const loadDelegations = async () => {
    setIsLoading(true);
    const delegationEntries: DelegationEntry[] = [];

    for (const delegation of sampleDelegations) {
      delegationEntries.push({
        owner: delegation.owner,
        delegate: delegation.delegate,
        status: null,
        isLoading: true,
      });
    }

    setDelegations(delegationEntries);

    // Load status for each delegation
    for (let i = 0; i < delegationEntries.length; i++) {
      const entry = delegationEntries[i];
      const status = await loadDelegationStatus(entry.owner, entry.delegate);
      
      setDelegations(prev => prev.map((item, index) => 
        index === i ? { ...item, status, isLoading: false } : item
      ));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedAddress) {
      loadDelegations();
    } else {
      // Clear delegations when wallet disconnects
      setDelegations([]);
    }
  }, [selectedAddress]);

  const handleSearch = async () => {
    if (!searchOwner || !searchDelegate) {
      alert('Please enter both owner and delegate addresses');
      return;
    }

    const newEntry: DelegationEntry = {
      owner: searchOwner,
      delegate: searchDelegate,
      status: null,
      isLoading: true,
    };

    setDelegations(prev => [...prev, newEntry]);

    const status = await loadDelegationStatus(searchOwner, searchDelegate);
    
    setDelegations(prev => prev.map(item => 
      item.owner === searchOwner && item.delegate === searchDelegate
        ? { ...item, status, isLoading: false }
        : item
    ));

    setSearchOwner('');
    setSearchDelegate('');
  };

  const getStatusBadge = (status: DelegationStatus | null, isLoading: boolean) => {
    if (isLoading) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">Loading...</span>;
    }

    if (!status) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded-full">Not Found</span>;
    }

    if (status.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded-full">Active</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full">Inactive</span>;
    }
  };

  const getRoleText = (owner: string, delegate: string) => {
    if (owner === selectedAddress && delegate === selectedAddress) {
      return { text: 'Self-Delegation', color: 'purple' };
    } else if (owner === selectedAddress) {
      return { text: 'You Own', color: 'blue' };
    } else if (delegate === selectedAddress) {
      return { text: 'You Delegate', color: 'green' };
    } else {
      return { text: 'Third Party', color: 'gray' };
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Delegation Explorer
        </h2>
        <p className="text-gray-600">
          View and search for delegation contracts between addresses.
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Delegation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="searchOwner" className="block text-sm font-medium text-gray-700 mb-1">
              Owner Address
            </label>
            <input
              type="text"
              id="searchOwner"
              value={searchOwner}
              onChange={(e) => setSearchOwner(e.target.value)}
              placeholder="SP1ABC..."
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md font-mono text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="searchDelegate" className="block text-sm font-medium text-gray-700 mb-1">
              Delegate Address
            </label>
            <input
              type="text"
              id="searchDelegate"
              value={searchDelegate}
              onChange={(e) => setSearchDelegate(e.target.value)}
              placeholder="SP1XYZ..."
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md font-mono text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            disabled={!searchOwner || !searchDelegate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search Delegation
          </button>
        </div>
      </div>

      {/* Delegations List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Delegations ({delegations.length})
          </h3>
          <button
            onClick={loadDelegations}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {delegations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714m0 0A9.971 9.971 0 0118 32a9.971 9.971 0 013.288.714m0 0A9.971 9.971 0 0124 36a9.971 9.971 0 013.288-4.286"
              />
            </svg>
            <p className="text-gray-600">No delegations found</p>
            <p className="text-sm text-gray-500 mt-1">Use the search above to find specific delegations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {delegations.map((delegation, index) => {
              const role = getRoleText(delegation.owner, delegation.delegate);
              
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(delegation.status, delegation.isLoading)}
                      <span className={`px-2 py-1 text-xs font-medium bg-${role.color}-100 text-${role.color}-800 rounded-full`}>
                        {role.text}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Owner</p>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                        {delegation.owner}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Delegate</p>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                        {delegation.delegate}
                      </p>
                    </div>
                  </div>

                  {delegation.status && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Total Amount</p>
                        <p className="text-gray-900">{formatSTX(delegation.status.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Available</p>
                        <p className="text-gray-900">{formatSTX(delegation.status.availableAmount)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Daily Limit</p>
                        <p className="text-gray-900">{formatSTX(delegation.status.dailyLimit)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Daily Remaining</p>
                        <p className="text-gray-900">{formatSTX(delegation.status.dailyRemaining)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegationList;