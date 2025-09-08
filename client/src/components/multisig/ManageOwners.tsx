import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultisigContract } from './contract';
import { useMultisig } from './MultisigContext';
import { Users, Plus, Trash2, Settings } from 'lucide-react';

interface ManageOwnersProps {
  onRefresh?: () => void;
}

const ManageOwners: React.FC<ManageOwnersProps> = ({ onRefresh }) => {
  const { walletAddress, isWalletReady } = useMultisig();
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newOwner, setNewOwner] = useState('');
  const [removeOwner, setRemoveOwner] = useState('');
  const [newThreshold, setNewThreshold] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<'add' | 'remove' | 'threshold' | null>(null);

  const loadWalletInfo = async () => {
    if (!isWalletReady || !walletAddress) return;

    setIsLoading(true);
    try {
      const [info, ownerStatus] = await Promise.all([
        MultisigContract.getWalletInfo(),
        MultisigContract.checkIsOwner(walletAddress)
      ]);
      
      setWalletInfo(info);
      setIsOwner(ownerStatus);
      
      if (info) {
        setNewThreshold(info.approvalThreshold);
      }
    } catch (error) {
      console.error('Error loading wallet info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWalletInfo();
  }, [isWalletReady, walletAddress]);

  const handleAddOwner = async () => {
    if (!newOwner || !isValidAddress(newOwner)) return;

    try {
      await MultisigContract.addOwner(newOwner);
      setNewOwner('');
      setActiveAction(null);
      setTimeout(() => {
        loadWalletInfo();
        onRefresh?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to add owner:', error);
    }
  };

  const handleRemoveOwner = async () => {
    if (!removeOwner || !isValidAddress(removeOwner)) return;

    try {
      await MultisigContract.removeOwner(removeOwner);
      setRemoveOwner('');
      setActiveAction(null);
      setTimeout(() => {
        loadWalletInfo();
        onRefresh?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to remove owner:', error);
    }
  };

  const handleChangeThreshold = async () => {
    if (!newThreshold || newThreshold <= 0) return;

    try {
      await MultisigContract.changeThreshold(newThreshold);
      setActiveAction(null);
      setTimeout(() => {
        loadWalletInfo();
        onRefresh?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to change threshold:', error);
    }
  };

  const isValidAddress = (address: string): boolean => {
    return /^S[TP][A-Z0-9]{39}$/.test(address);
  };

  if (!isWalletReady) {
    return (
      <div className="p-6 text-center">
        <div className="text-yellow-600 mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Not Ready</h3>
        <p className="text-gray-600">
          Please ensure your wallet is connected and an address is detected.
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">🚫</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">
          Only wallet owners can manage owners and settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Owners</h2>
          <p className="text-gray-600">Add/remove owners and change approval threshold</p>
        </div>
      </div>

      {/* Current Wallet Info */}
      {walletInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Total Owners</div>
            <div className="text-2xl font-bold text-gray-900">{walletInfo.ownersCount}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Approval Threshold</div>
            <div className="text-2xl font-bold text-gray-900">
              {walletInfo.approvalThreshold}/{walletInfo.ownersCount}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-700">Wallet Balance</div>
            <div className="text-2xl font-bold text-gray-900">
              {(walletInfo.balance / 1_000_000).toFixed(6)} STX
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={activeAction === 'add' ? 'default' : 'outline'}
          onClick={() => setActiveAction(activeAction === 'add' ? null : 'add')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Owner
        </Button>
        <Button
          variant={activeAction === 'remove' ? 'default' : 'outline'}
          onClick={() => setActiveAction(activeAction === 'remove' ? null : 'remove')}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remove Owner
        </Button>
        <Button
          variant={activeAction === 'threshold' ? 'default' : 'outline'}
          onClick={() => setActiveAction(activeAction === 'threshold' ? null : 'threshold')}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Change Threshold
        </Button>
      </div>

      {/* Add Owner Form */}
      {activeAction === 'add' && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-3">Add New Owner</h3>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter owner address (SP... or ST...)"
                className={`block w-full px-4 py-3 border-2 rounded-lg focus:ring-2 text-sm font-mono bg-white text-gray-900 placeholder-gray-500 focus:outline-none ${
                  newOwner && !isValidAddress(newOwner)
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {newOwner && !isValidAddress(newOwner) && (
                <div className="text-sm text-red-600 mt-1">
                  Please enter a valid Stacks address (starts with SP or ST)
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddOwner}
                disabled={!newOwner || !isValidAddress(newOwner)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Owner
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveAction(null);
                  setNewOwner('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className="text-xs text-green-700 mt-2">
            <strong>Note:</strong> Adding an owner requires multisig approval from existing owners.
          </div>
        </div>
      )}

      {/* Remove Owner Form */}
      {activeAction === 'remove' && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-medium text-red-900 mb-3">Remove Owner</h3>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={removeOwner}
                onChange={(e) => setRemoveOwner(e.target.value)}
                placeholder="Enter owner address to remove"
                className={`block w-full px-4 py-3 border-2 rounded-lg focus:ring-2 text-sm font-mono bg-white text-gray-900 placeholder-gray-500 focus:outline-none ${
                  removeOwner && !isValidAddress(removeOwner)
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {removeOwner && !isValidAddress(removeOwner) && (
                <div className="text-sm text-red-600 mt-1">
                  Please enter a valid Stacks address (starts with SP or ST)
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRemoveOwner}
                disabled={!removeOwner || !isValidAddress(removeOwner) || removeOwner === walletAddress}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove Owner
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveAction(null);
                  setRemoveOwner('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className="text-xs text-red-700 mt-2">
            <strong>Warning:</strong> You cannot remove yourself. Removing an owner requires multisig approval.
          </div>
        </div>
      )}

      {/* Change Threshold Form */}
      {activeAction === 'threshold' && walletInfo && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-3">Change Approval Threshold</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                New Threshold
              </label>
              <select
                value={newThreshold}
                onChange={(e) => setNewThreshold(Number(e.target.value))}
                className="block w-full px-4 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none border-gray-300"
              >
                {Array.from({ length: walletInfo.ownersCount }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} of {walletInfo.ownersCount} signatures required
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleChangeThreshold}
                disabled={newThreshold === walletInfo.approvalThreshold}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Change Threshold
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveAction(null);
                  setNewThreshold(walletInfo.approvalThreshold);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Note:</strong> Changing the threshold requires multisig approval from existing owners.
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>Important:</strong> All owner management operations (adding/removing owners, changing threshold) 
        require approval from the current threshold number of owners. These changes will create transactions 
        that need to be approved and executed like any other multisig transaction.
      </div>
    </div>
  );
};

export default ManageOwners;